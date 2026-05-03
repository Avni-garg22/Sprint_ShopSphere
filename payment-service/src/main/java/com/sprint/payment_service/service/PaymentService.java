package com.sprint.payment_service.service;

import com.sprint.payment_service.entity.Payment;
import com.sprint.payment_service.entity.PaymentStatus;
import com.sprint.payment_service.repository.PaymentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    
    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String razorpayCurrency;
    
    public PaymentService(PaymentRepository paymentRepository, RabbitTemplate rabbitTemplate) {
        this.paymentRepository = paymentRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public Payment processPaymentForOrder(Long orderId, Double amount) {
        return processPaymentForOrder(orderId, amount, null);
    }

    @Transactional
    public Payment processPaymentForOrder(Long orderId, Double amount, String mode) {
        log.info("Processing payment for orderId: {}, amount: {}", orderId, amount);

        PaymentStatus status = (amount != null && amount > 0)
                ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .mode(mode)
                .status(status)
                .processedAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("orderId", orderId);
            event.put("status", status.name());
            rabbitTemplate.convertAndSend("payment-events-queue", event);
            log.info("Emitted payment event for orderId: {} with status: {}", orderId, status);
        } catch (Exception e) {
            log.error("Failed to emit payment event", e);
        }

        return saved;
    }

    @Transactional
    public Map<String, Object> createRazorpayOrder(Long appOrderId, Double amount) {
        ensureRazorpayConfigured();
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        long amountInPaise = toCurrencySubunits(amount);
        if ("INR".equalsIgnoreCase(razorpayCurrency) && amountInPaise < 100) {
            throw new IllegalArgumentException("Razorpay amount must be at least INR 1.00");
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("amount", amountInPaise);
            payload.put("currency", razorpayCurrency);
            payload.put("receipt", "order_" + appOrderId + "_" + UUID.randomUUID().toString().substring(0, 8));

            String auth = Base64.getEncoder().encodeToString(
                    (razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Razorpay order creation failed: {}", response.body());
                throw new RuntimeException("Unable to create Razorpay order");
            }

            Map<String, Object> razorpayOrder = objectMapper.readValue(
                    response.body(), new TypeReference<Map<String, Object>>() {});

            Payment pendingPayment = Payment.builder()
                    .orderId(appOrderId)
                    .amount(amount)
                    .mode("RAZORPAY")
                    .razorpayOrderId(razorpayOrder.get("id").toString())
                    .status(PaymentStatus.PENDING)
                    .processedAt(LocalDateTime.now())
                    .build();
            paymentRepository.save(pendingPayment);

            Map<String, Object> result = new HashMap<>();
            result.put("keyId", razorpayKeyId);
            result.put("orderId", razorpayOrder.get("id"));
            result.put("amount", razorpayOrder.get("amount"));
            result.put("currency", razorpayOrder.get("currency"));
            result.put("appOrderId", appOrderId);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Unable to create Razorpay order", e);
        }
    }

    @Transactional
    public Payment verifyRazorpayPayment(Long appOrderId, Double amount, String razorpayOrderId,
                                         String razorpayPaymentId, String razorpaySignature) {
        ensureRazorpayConfigured();
        if (!isValidSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            throw new IllegalArgumentException("Razorpay payment verification failed");
        }

        Payment payment = paymentRepository
                .findTopByOrderIdAndRazorpayOrderIdOrderByIdDesc(appOrderId, razorpayOrderId)
                .orElseGet(() -> Payment.builder()
                        .orderId(appOrderId)
                        .amount(amount)
                        .mode("RAZORPAY")
                        .razorpayOrderId(razorpayOrderId)
                        .build());
        payment.setAmount(amount);
        payment.setMode("RAZORPAY");
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setProcessedAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        publishPaymentEvent(appOrderId, PaymentStatus.SUCCESS);
        return saved;
    }

    private boolean isValidSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = bytesToHex(digest);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    razorpaySignature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to verify Razorpay signature", e);
            return false;
        }
    }

    private long toCurrencySubunits(Double amount) {
        return BigDecimal.valueOf(amount)
                .movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    private void ensureRazorpayConfigured() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank()
                || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay API keys are not configured");
        }
    }

    private void publishPaymentEvent(Long orderId, PaymentStatus status) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("orderId", orderId);
            event.put("status", status.name());
            rabbitTemplate.convertAndSend("payment-events-queue", event);
            log.info("Emitted payment event for orderId: {} with status: {}", orderId, status);
        } catch (Exception e) {
            log.error("Failed to emit payment event", e);
        }
    }
}
