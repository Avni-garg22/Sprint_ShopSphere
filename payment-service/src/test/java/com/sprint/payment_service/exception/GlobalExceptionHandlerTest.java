package com.sprint.payment_service.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Mock
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/payment/1");
    }

    @Test
    void handlePaymentNotFoundException_ShouldReturn404() {
        PaymentNotFoundException ex = new PaymentNotFoundException("Payment not found for Order ID: 1");
        ResponseEntity<Object> response = handler.handlePaymentNotFoundException(ex, webRequest);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void handlePaymentNotFoundException_ShouldIncludeMessage() {
        PaymentNotFoundException ex = new PaymentNotFoundException("Payment not found for Order ID: 99");
        ResponseEntity<Object> response = handler.handlePaymentNotFoundException(ex, webRequest);
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("Payment not found for Order ID: 99", body.get("message"));
    }

    @Test
    void handlePaymentNotFoundException_ShouldIncludeTimestamp() {
        PaymentNotFoundException ex = new PaymentNotFoundException("Payment not found");
        ResponseEntity<Object> response = handler.handlePaymentNotFoundException(ex, webRequest);
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body.get("timestamp"));
    }
}
