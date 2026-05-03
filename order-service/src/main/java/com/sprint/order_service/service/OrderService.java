package com.sprint.order_service.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprint.order_service.entity.Order;
import com.sprint.order_service.notification.NotificationEventPublisher;
import com.sprint.order_service.repository.OrderRepository;
import com.sprint.order_service.repository.OutboxEventRepository;
import com.sprint.order_service.entity.OutboxEvent;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private NotificationEventPublisher notificationEventPublisher;

    @Transactional
    public Order placeOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Order must have at least one item");
        }

        order.getItems().forEach(item -> item.setOrder(order));
        order.setStatus("PENDING");

        // Calculate total price
        double totalPrice = order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        order.setTotalPrice(totalPrice);

        Order savedOrder = repo.save(order);

        if (!waitsForExternalPayment(savedOrder.getPaymentMode())) {
            // Create proper JSON message for payment service
            String message = String.format("{\"id\":%d,\"totalPrice\":%.2f,\"paymentMode\":\"%s\"}",
                    savedOrder.getId(), totalPrice, savedOrder.getPaymentMode() != null ? savedOrder.getPaymentMode() : "");

            // Transactional Outbox Pattern Implementation
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setPayload(message);
            outboxEvent.setProcessed(false);
            outboxEventRepository.save(outboxEvent);
        }

        notificationEventPublisher.notifyUser(
                savedOrder,
                "Order placed",
                "Your order #" + savedOrder.getId() + " has been placed and is waiting for confirmation.",
                "ORDER_PLACED");
        notificationEventPublisher.notifyAdmin(
                savedOrder,
                "New order received",
                "Order #" + savedOrder.getId() + " was placed by user " + savedOrder.getUserId() + ".",
                "ORDER_PLACED");

        return savedOrder;
    }

    private boolean waitsForExternalPayment(String paymentMode) {
        if (paymentMode == null) {
            return false;
        }
        String normalized = paymentMode.trim().toUpperCase();
        return normalized.equals("RAZORPAY")
                || normalized.equals("CARD")
                || normalized.equals("UPI")
                || normalized.equals("ONLINE");
    }

    @Transactional
    public Order getOrderById(Long id) {
        Order order = repo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.getItems().size(); // force load
        return order;
    }

    @Transactional
    public List<Order> getAllOrders() {
        List<Order> orders = repo.findAll();
        orders.forEach(o -> o.getItems().size()); // force load
        return orders;
    }

    @Transactional
    public List<Order> getOrdersByUser(Long userId) {
        List<Order> orders = repo.findByUserId(userId);
        orders.forEach(o -> o.getItems().size()); // force load
        return orders;
    }

    @Transactional
    public Order updateStatus(Long id, String status) {
        Order order = repo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        Order saved = repo.save(order);

        notificationEventPublisher.notifyUser(
                saved,
                "Order status updated",
                "Your order #" + saved.getId() + " is now " + saved.getStatus() + ".",
                "ORDER_STATUS_UPDATED");
        notificationEventPublisher.notifyAdmin(
                saved,
                "Order status updated",
                "Order #" + saved.getId() + " is now " + saved.getStatus() + ".",
                "ORDER_STATUS_UPDATED");
        return saved;
    }
}
