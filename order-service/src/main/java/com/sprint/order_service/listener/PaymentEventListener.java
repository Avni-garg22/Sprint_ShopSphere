package com.sprint.order_service.listener;

import com.sprint.order_service.entity.Order;
import com.sprint.order_service.notification.NotificationEventPublisher;
import com.sprint.order_service.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
public class PaymentEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventListener.class);

    private final OrderRepository orderRepository;
    private final NotificationEventPublisher notificationEventPublisher;

    public PaymentEventListener(OrderRepository orderRepository, NotificationEventPublisher notificationEventPublisher) {
        this.orderRepository = orderRepository;
        this.notificationEventPublisher = notificationEventPublisher;
    }

    @RabbitListener(queues = "payment-events-queue")
    @Transactional
    public void handlePaymentEvent(Map<String, Object> payload) {
        log.info("OrderService received payment event: {}", payload);
        try {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            String paymentStatus = payload.get("status").toString();

            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                String newStatus = "SUCCESS".equals(paymentStatus) ? "CONFIRMED" : "CANCELLED";
                order.setStatus(newStatus);
                orderRepository.save(order);
                log.info("Order {} status updated to {}", orderId, newStatus);
                notificationEventPublisher.notifyUser(
                        order,
                        "Payment " + paymentStatus.toLowerCase(),
                        "Your order #" + orderId + " has been " + newStatus + ".",
                        "PAYMENT_STATUS");
                notificationEventPublisher.notifyAdmin(
                        order,
                        "Payment " + paymentStatus.toLowerCase(),
                        "Order #" + orderId + " payment result updated the order to " + newStatus + ".",
                        "PAYMENT_STATUS");
            } else {
                log.warn("Order {} not found", orderId);
            }
        } catch (Exception e) {
            log.error("Error processing payment event", e);
        }
    }
}
