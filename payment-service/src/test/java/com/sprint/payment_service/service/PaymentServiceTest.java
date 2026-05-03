package com.sprint.payment_service.service;

import com.sprint.payment_service.entity.Payment;
import com.sprint.payment_service.entity.PaymentStatus;
import com.sprint.payment_service.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void processPayment_ShouldSetStatusSuccess_WhenAmountIsPositive() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(1L, 500.0);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertEquals(PaymentStatus.SUCCESS, captor.getValue().getStatus());
        assertEquals(1L, captor.getValue().getOrderId());
        assertEquals(500.0, captor.getValue().getAmount());
    }

    @Test
    void processPayment_ShouldSetStatusSuccess_WhenAmountGreaterThan1000() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(2L, 1500.0);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertEquals(PaymentStatus.SUCCESS, captor.getValue().getStatus());
    }

    @Test
    void processPayment_ShouldSetStatusSuccess_WhenAmountExactly1000() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(3L, 1000.0);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertEquals(PaymentStatus.SUCCESS, captor.getValue().getStatus());
    }

    @Test
    void processPayment_ShouldSetStatusFailed_WhenAmountIsNull() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(4L, null);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertEquals(PaymentStatus.FAILED, captor.getValue().getStatus());
    }

    @Test
    @SuppressWarnings("unchecked")
    void processPayment_ShouldSendSuccessEventToRabbitMQ() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(1L, 500.0);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(rabbitTemplate).convertAndSend(eq("payment-events-queue"), captor.capture());
        assertEquals(1L, captor.getValue().get("orderId"));
        assertEquals("SUCCESS", captor.getValue().get("status"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void processPayment_ShouldSendFailedEventToRabbitMQ_WhenAmountIsInvalid() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        paymentService.processPaymentForOrder(2L, 0.0);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(rabbitTemplate).convertAndSend(eq("payment-events-queue"), captor.capture());
        assertEquals("FAILED", captor.getValue().get("status"));
    }
}
