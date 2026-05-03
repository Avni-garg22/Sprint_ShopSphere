package com.sprint.notification_service.rabbitmq;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.sprint.notification_service.dto.NotificationEvent;
import com.sprint.notification_service.entity.Notification;
import com.sprint.notification_service.service.NotificationService;

@Service
public class RabbitConsumer {

    private static final Logger log = LoggerFactory.getLogger(RabbitConsumer.class);

    private final NotificationService notificationService;

    public RabbitConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "order-notification-queue")
    public void consume(Map<String, Object> payload) {
        log.debug("RabbitConsumer received message: {}", payload);
        try {
            Notification saved = notificationService.create(toEvent(payload));
            log.info("Notification saved: id={} type={} recipient={}/{}",
                    saved.getId(), saved.getType(),
                    saved.getRecipientType(), saved.getRecipientId());
        } catch (Exception e) {
            log.error("RabbitConsumer: failed to process notification message", e);
        }
    }

    private NotificationEvent toEvent(Map<?, ?> payload) {
        NotificationEvent event = new NotificationEvent();
        event.setRecipientType(stringValue(payload.get("recipientType")));
        event.setRecipientId(longValue(payload.get("recipientId")));
        event.setTitle(stringValue(payload.get("title")));
        event.setMessage(stringValue(payload.get("message")));
        event.setType(stringValue(payload.get("type")));
        event.setOrderId(longValue(payload.get("orderId")));
        event.setStatus(stringValue(payload.get("status")));
        return event;
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private Long longValue(Object value) {
        if (value == null) return null;
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            log.warn("RabbitConsumer: could not parse Long from value '{}'", value);
            return null;
        }
    }
}
