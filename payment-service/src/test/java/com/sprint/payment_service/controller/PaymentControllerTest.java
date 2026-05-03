package com.sprint.payment_service.controller;

import com.sprint.payment_service.dto.PaymentDTO;
import com.sprint.payment_service.entity.Payment;
import com.sprint.payment_service.entity.PaymentStatus;
import com.sprint.payment_service.repository.PaymentRepository;
import com.sprint.payment_service.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private Payment buildPayment(Long id, Long orderId, Double amount, PaymentStatus status) {
        Payment p = new Payment();
        p.setId(id);
        p.setOrderId(orderId);
        p.setAmount(amount);
        p.setStatus(status);
        p.setProcessedAt(LocalDateTime.now());
        return p;
    }

    @Test
    void getAllPayments_ShouldReturnAllPayments() {
        List<Payment> payments = Arrays.asList(
                buildPayment(1L, 1L, 500.0, PaymentStatus.SUCCESS),
                buildPayment(2L, 2L, 1500.0, PaymentStatus.FAILED)
        );
        when(paymentRepository.findAll()).thenReturn(payments);

        ResponseEntity<List<PaymentDTO>> response = paymentController.getAllPayments();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().size());
        verify(paymentRepository).findAll();
    }

    @Test
    void getAllPayments_ShouldReturnEmptyList_WhenNoPayments() {
        when(paymentRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<PaymentDTO>> response = paymentController.getAllPayments();

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void getPaymentByOrderId_ShouldReturnPayments_WhenExists() {
        List<Payment> payments = List.of(buildPayment(1L, 1L, 500.0, PaymentStatus.SUCCESS));
        when(paymentRepository.findByOrderId(1L)).thenReturn(payments);

        ResponseEntity<List<PaymentDTO>> response = paymentController.getPaymentByOrderId(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals(1L, response.getBody().get(0).getOrderId());
    }

    @Test
    void getPaymentByOrderId_ShouldReturnEmptyList_WhenNotFound() {
        when(paymentRepository.findByOrderId(99L)).thenReturn(Collections.emptyList());

        ResponseEntity<List<PaymentDTO>> response = paymentController.getPaymentByOrderId(99L);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void getAllPayments_ShouldMapStatusCorrectly() {
        Payment payment = buildPayment(1L, 1L, 500.0, PaymentStatus.SUCCESS);
        when(paymentRepository.findAll()).thenReturn(List.of(payment));

        ResponseEntity<List<PaymentDTO>> response = paymentController.getAllPayments();

        assertEquals(PaymentStatus.SUCCESS, response.getBody().get(0).getStatus());
    }

    @Test
    void processPayment_ShouldReturnProcessedPayment() {
        Payment payment = buildPayment(1L, 10L, 250.0, PaymentStatus.SUCCESS);
        when(paymentService.processPaymentForOrder(10L, 250.0, "upi")).thenReturn(payment);

        ResponseEntity<PaymentDTO> response = paymentController.processPayment(
                Map.of("orderId", 10L, "amount", 250.0, "mode", "upi")
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals(10L, response.getBody().getOrderId());
        assertEquals(PaymentStatus.SUCCESS, response.getBody().getStatus());
    }
}
