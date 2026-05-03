package com.sprint.payment_service.listener;

import com.sprint.payment_service.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderEventListenerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private OrderEventListener orderEventListener;

    @Test
    void handleOrderEvent_ShouldProcessPayment_WhenValidPayload() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "1");
        payload.put("totalPrice", "500.0");
        payload.put("paymentMode", "cod");

        orderEventListener.handleOrderEvent(payload);

        verify(paymentService).processPaymentForOrder(1L, 500.0, "cod");
    }

    @Test
    void handleOrderEvent_ShouldSkipAutomaticProcessing_ForRazorpayPayload() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "1");
        payload.put("totalPrice", "500.0");
        payload.put("paymentMode", "RAZORPAY");

        orderEventListener.handleOrderEvent(payload);

        verify(paymentService, never()).processPaymentForOrder(any(), any(), any());
    }

    @Test
    void handleOrderEvent_ShouldUseZeroAmount_WhenTotalPriceNull() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "2");
        payload.put("totalPrice", null);

        orderEventListener.handleOrderEvent(payload);

        verify(paymentService).processPaymentForOrder(2L, 0.0, null);
    }

    @Test
    void handleOrderEvent_ShouldNotThrow_WhenPayloadInvalid() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "invalid");

        orderEventListener.handleOrderEvent(payload);

        verify(paymentService, never()).processPaymentForOrder(any(), any(), any());
    }
}
