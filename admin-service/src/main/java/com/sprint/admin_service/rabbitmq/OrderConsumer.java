package com.sprint.admin_service.rabbitmq;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sprint.admin_service.entity.Order;
import com.sprint.admin_service.repository.OrderRepository;

@Service
public class OrderConsumer {

    @Autowired
    private OrderRepository repo;

    @RabbitListener(queuesToDeclare = @org.springframework.amqp.rabbit.annotation.Queue(value = "order-admin-queue", durable = "true"))
    public void consume(String message) {
        System.out.println("Admin received: " + message);

        String[] parts = message.split(",");
        if (parts.length < 3) {
            System.out.println("Invalid message format, skipping: " + message);
            return;
        }

        Order order = new Order();
        order.setProductName(parts[0].trim());
        order.setQuantity(Integer.parseInt(parts[1].trim()));
        order.setPrice(Double.parseDouble(parts[2].trim()));
        order.setStatus("PAID");

        repo.save(order);
        System.out.println("Order saved in Admin DB");
    }
}
