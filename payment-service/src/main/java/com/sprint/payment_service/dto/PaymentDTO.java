package com.sprint.payment_service.dto;

import com.sprint.payment_service.entity.PaymentStatus;
import java.time.LocalDateTime;

public class PaymentDTO {

    private Long id;
    private Long orderId;
    private Double amount;
    private String mode;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private PaymentStatus status;
    private LocalDateTime processedAt;

    public PaymentDTO() {}

    private PaymentDTO(Builder builder) {
        this.id = builder.id;
        this.orderId = builder.orderId;
        this.amount = builder.amount;
        this.mode = builder.mode;
        this.razorpayOrderId = builder.razorpayOrderId;
        this.razorpayPaymentId = builder.razorpayPaymentId;
        this.status = builder.status;
        this.processedAt = builder.processedAt;
    }

    public static Builder builder() { return new Builder(); }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Double getAmount() { return amount; }
    public String getMode() { return mode; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public PaymentStatus getStatus() { return status; }
    public LocalDateTime getProcessedAt() { return processedAt; }

    public static class Builder {
        private Long id;
        private Long orderId;
        private Double amount;
        private String mode;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private PaymentStatus status;
        private LocalDateTime processedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder orderId(Long orderId) { this.orderId = orderId; return this; }
        public Builder amount(Double amount) { this.amount = amount; return this; }
        public Builder mode(String mode) { this.mode = mode; return this; }
        public Builder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
        public Builder razorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder processedAt(LocalDateTime processedAt) { this.processedAt = processedAt; return this; }
        public PaymentDTO build() { return new PaymentDTO(this); }
    }
}
