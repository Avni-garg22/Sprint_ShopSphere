package com.sprint.order_service.notification;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.sprint.order_service.config.RabbitMQConfig;
import com.sprint.order_service.entity.Order;

@Component
public class NotificationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public NotificationEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void notifyUser(Order order, String title, String message, String type) {
        publish("USER", order.getUserId(), title, message, type, order);
    }

    public void notifyAdmin(Order order, String title, String message, String type) {
        publish("ADMIN", null, title, message, type, order);
    }

    private void publish(String recipientType, Long recipientId, String title, String message, String type, Order order) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientType", recipientType);
            payload.put("recipientId", recipientId);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type);
            payload.put("orderId", order.getId());
            payload.put("status", order.getStatus());
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_QUEUE, payload);
        } catch (Exception e) {
            log.error("Failed to publish notification event for order {}", order.getId(), e);
        }
    }
}
