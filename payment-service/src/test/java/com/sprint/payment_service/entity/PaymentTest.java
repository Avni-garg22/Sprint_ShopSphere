package com.sprint.payment_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class PaymentTest {

    @Test
    void payment_ShouldSetAndGetAllFields() {
        Payment p = new Payment();
        p.setId(1L);
        p.setOrderId(10L);
        p.setAmount(500.0);
        p.setStatus(PaymentStatus.SUCCESS);
        p.setProcessedAt(LocalDateTime.now());

        assertEquals(1L, p.getId());
        assertEquals(10L, p.getOrderId());
        assertEquals(500.0, p.getAmount());
        assertEquals(PaymentStatus.SUCCESS, p.getStatus());
        assertNotNull(p.getProcessedAt());
    }

    @Test
    void payment_ShouldSupportBuilder() {
        Payment p = Payment.builder()
                .orderId(1L)
                .amount(999.0)
                .status(PaymentStatus.FAILED)
                .processedAt(LocalDateTime.now())
                .build();

        assertEquals(1L, p.getOrderId());
        assertEquals(999.0, p.getAmount());
        assertEquals(PaymentStatus.FAILED, p.getStatus());
    }

    @Test
    void payment_DefaultConstructor_ShouldWork() {
        Payment p = new Payment();
        assertNotNull(p);
        assertNull(p.getId());
    }

    @Test
    void paymentStatus_ShouldHaveSuccessAndFailed() {
        assertEquals("SUCCESS", PaymentStatus.SUCCESS.name());
        assertEquals("FAILED", PaymentStatus.FAILED.name());
    }
}
