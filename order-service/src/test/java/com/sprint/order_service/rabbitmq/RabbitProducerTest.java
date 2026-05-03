package com.sprint.order_service.rabbitmq;

import com.sprint.order_service.config.RabbitMQConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.Mockito.*;

class RabbitProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private RabbitProducer rabbitProducer;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        rabbitProducer = new RabbitProducer();
        var field = RabbitProducer.class.getDeclaredField("rabbitTemplate");
        field.setAccessible(true);
        field.set(rabbitProducer, rabbitTemplate);
    }

    @Test
    void sendMessage_ShouldCallRabbitTemplate() {
        rabbitProducer.sendMessage("test message");
        verify(rabbitTemplate).convertAndSend(RabbitMQConfig.ORDER_QUEUE, "test message");
    }

    @Test
    void sendMessage_ShouldSendCorrectMessage() {
        String message = "{\"id\":1,\"status\":\"PENDING\"}";
        rabbitProducer.sendMessage(message);
        verify(rabbitTemplate).convertAndSend(RabbitMQConfig.ORDER_QUEUE, message);
    }
}
