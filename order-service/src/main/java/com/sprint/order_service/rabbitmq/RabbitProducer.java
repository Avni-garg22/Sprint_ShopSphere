package com.sprint.order_service.rabbitmq;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sprint.order_service.config.RabbitMQConfig;

@Service
public class RabbitProducer {

    private static final Logger log = LoggerFactory.getLogger(RabbitProducer.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_QUEUE, message);
        log.info("Message sent to {}", RabbitMQConfig.ORDER_QUEUE);
    }
}
