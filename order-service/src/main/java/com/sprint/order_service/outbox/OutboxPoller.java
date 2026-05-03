package com.sprint.order_service.outbox;

import com.sprint.order_service.entity.OutboxEvent;
import com.sprint.order_service.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Component
public class OutboxPoller {

    private static final Logger log = LoggerFactory.getLogger(OutboxPoller.class);

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void pollOutbox() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByProcessedFalse();
        if (pendingEvents.isEmpty()) {
            return; // nothing to do — skip logging
        }

        log.info("OutboxPoller: processing {} pending event(s)", pendingEvents.size());
        for (OutboxEvent event : pendingEvents) {
            try {
                Map<?, ?> payload = objectMapper.readValue(event.getPayload(), Map.class);
                rabbitTemplate.convertAndSend("order-events-queue", payload);
                event.setProcessed(true);
                outboxEventRepository.save(event);
                log.info("OutboxPoller: dispatched event {} to order-events-queue", event.getId());
            } catch (Exception e) {
                log.error("OutboxPoller: failed to process event {}", event.getId(), e);
            }
        }
    }
}
