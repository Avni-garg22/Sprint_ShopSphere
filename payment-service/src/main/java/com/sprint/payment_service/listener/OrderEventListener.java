package com.sprint.payment_service.listener;

import com.sprint.payment_service.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);
    
    private final PaymentService paymentService;

    public OrderEventListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = "order-events-queue")
    public void handleOrderEvent(Map<String, Object> payload) {
        log.info("Received order event: {}", payload);
        try {
            Long orderId = Long.valueOf(payload.get("id").toString());
            Double amount = payload.get("totalPrice") != null
                    ? Double.valueOf(payload.get("totalPrice").toString()) : 0.0;
            String paymentMode = payload.get("paymentMode") != null
                    ? payload.get("paymentMode").toString() : null;

            if (waitsForExternalPayment(paymentMode)) {
                log.info("Skipping automatic payment processing for {} order {}", paymentMode, orderId);
                return;
            }

            paymentService.processPaymentForOrder(orderId, amount, paymentMode);
        } catch (Exception e) {
            log.error("Error processing order event in PaymentService", e);
        }
    }

    private boolean waitsForExternalPayment(String paymentMode) {
        if (paymentMode == null) {
            return false;
        }
        String normalized = paymentMode.trim().toUpperCase();
        return normalized.equals("RAZORPAY")
                || normalized.equals("CARD")
                || normalized.equals("UPI")
                || normalized.equals("ONLINE");
    }
}
