package com.sprint.notification_service.rabbitmq;

import com.sprint.notification_service.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RabbitConsumerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private RabbitConsumer rabbitConsumer;

    @Test
    void consume_ShouldCallNotificationService() {
        Map<String, Object> payload = Map.of(
            "recipientType", "USER",
            "recipientId", 1L,
            "title", "Order Confirmed",
            "message", "Order 1 has been CONFIRMED",
            "type", "ORDER_CONFIRMED",
            "orderId", 1L,
            "status", "CONFIRMED"
        );
        rabbitConsumer.consume(payload);
        verify(notificationService).create(any());
    }

    @Test
    void consume_ShouldHandleEmptyPayload() {
        rabbitConsumer.consume(Map.of());
        verify(notificationService).create(any());
    }

    @Test
    void consume_ShouldHandleCancelledOrder() {
        Map<String, Object> payload = Map.of(
            "recipientType", "USER",
            "recipientId", 2L,
            "title", "Order Cancelled",
            "message", "Order 2 has been CANCELLED",
            "type", "ORDER_CANCELLED",
            "orderId", 2L,
            "status", "CANCELLED"
        );
        rabbitConsumer.consume(payload);
        verify(notificationService).create(any());
    }
}
