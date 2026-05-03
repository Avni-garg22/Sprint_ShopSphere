package com.sprint.payment_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sprint.payment_service.dto.PaymentDTO;
import com.sprint.payment_service.entity.Payment;
import com.sprint.payment_service.repository.PaymentRepository;
import com.sprint.payment_service.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment API", description = "Endpoints for checking payment statuses")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    
    public PaymentController(PaymentRepository paymentRepository, PaymentService paymentService){
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
    }

    @GetMapping
    @Operation(summary = "Get all payments")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        List<PaymentDTO> payments = paymentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get payment by Order ID")
    public ResponseEntity<List<PaymentDTO>> getPaymentByOrderId(@PathVariable Long orderId) {
        List<PaymentDTO> dtos = paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Operation(summary = "Process payment")
    public ResponseEntity<PaymentDTO> processPayment(@RequestBody Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        String mode = request.get("mode") != null ? request.get("mode").toString() : null;
        Payment payment = paymentService.processPaymentForOrder(orderId, amount, mode);
        return ResponseEntity.ok(mapToDto(payment));
    }

    @PostMapping("/razorpay/order")
    @Operation(summary = "Create Razorpay checkout order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        Long appOrderId = Long.valueOf(request.get("orderId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        return ResponseEntity.ok(paymentService.createRazorpayOrder(appOrderId, amount));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Verify Razorpay checkout payment")
    public ResponseEntity<PaymentDTO> verifyRazorpayPayment(@RequestBody Map<String, Object> request) {
        Long appOrderId = Long.valueOf(request.get("orderId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        String razorpayOrderId = request.get("razorpayOrderId").toString();
        String razorpayPaymentId = request.get("razorpayPaymentId").toString();
        String razorpaySignature = request.get("razorpaySignature").toString();

        Payment payment = paymentService.verifyRazorpayPayment(
                appOrderId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature);
        return ResponseEntity.ok(mapToDto(payment));
    }

    private PaymentDTO mapToDto(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .mode(payment.getMode())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .status(payment.getStatus())
                .processedAt(payment.getProcessedAt())
                .build();
    }
}
