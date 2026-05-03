package com.sprint.payment_service.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Double amount;
    private String mode;
    private String razorpayOrderId;
    private String razorpayPaymentId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime processedAt;
    
    public Payment() {}
    
    public Payment(Long orderId, Double amount, String mode, String razorpayOrderId, String razorpayPaymentId,
                   PaymentStatus status, LocalDateTime processedAt) {
        this.orderId = orderId;
        this.amount = amount;
        this.mode = mode;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.status = status;
        this.processedAt = processedAt;
    }
    
    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    
    public static class PaymentBuilder {
        private Long orderId;
        private Double amount;
        private String mode;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private PaymentStatus status;
        private LocalDateTime processedAt;
        
        public PaymentBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }
        
        public PaymentBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public PaymentBuilder mode(String mode) {
            this.mode = mode;
            return this;
        }

        public PaymentBuilder razorpayOrderId(String razorpayOrderId) {
            this.razorpayOrderId = razorpayOrderId;
            return this;
        }

        public PaymentBuilder razorpayPaymentId(String razorpayPaymentId) {
            this.razorpayPaymentId = razorpayPaymentId;
            return this;
        }
        
        public PaymentBuilder status(PaymentStatus status) {
            this.status = status;
            return this;
        }
        
        public PaymentBuilder processedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
            return this;
        }
        
        public Payment build() {
            return new Payment(orderId, amount, mode, razorpayOrderId, razorpayPaymentId, status, processedAt);
        }
    }
}
