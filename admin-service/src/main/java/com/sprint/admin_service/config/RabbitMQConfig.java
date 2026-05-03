package com.sprint.admin_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public Queue adminQueue() {
        return new Queue("order-admin-queue", true);
    }

    @Bean
    public FanoutExchange orderExchange() {
        return new FanoutExchange("order-exchange");
    }

    @Bean
    public Binding adminBinding() {
        return BindingBuilder.bind(adminQueue()).to(orderExchange());
    }
}
