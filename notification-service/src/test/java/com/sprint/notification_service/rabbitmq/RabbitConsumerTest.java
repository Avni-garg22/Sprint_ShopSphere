package com.sprint.notification_service.rabbitmq;

import com.sprint.notification_service.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RabbitConsumerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private RabbitConsumer rabbitConsumer;

    @Test
    void consume_ShouldCallNotificationService() {
        rabbitConsumer.consume("Order 1 has been CONFIRMED");
        verify(notificationService).processNotification("Order 1 has been CONFIRMED");
    }

    @Test
    void consume_ShouldHandleEmptyMessage() {
        rabbitConsumer.consume("");
        verify(notificationService).processNotification("");
    }

    @Test
    void consume_ShouldHandleCancelledMessage() {
        rabbitConsumer.consume("Order 2 has been CANCELLED");
        verify(notificationService).processNotification("Order 2 has been CANCELLED");
    }
}
