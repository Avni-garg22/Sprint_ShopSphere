package com.sprint.order_service.service;

import com.sprint.order_service.entity.Order;
import com.sprint.order_service.entity.OrderItem;
import com.sprint.order_service.entity.OutboxEvent;
import com.sprint.order_service.notification.NotificationEventPublisher;
import com.sprint.order_service.repository.OrderRepository;
import com.sprint.order_service.repository.OutboxEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository repo;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private NotificationEventPublisher notificationEventPublisher;

    @InjectMocks
    private OrderService orderService;

    private Order buildOrder() {
        Order order = new Order();
        order.setUserId(1L);
        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setProductName("Test Product");
        item.setQuantity(2);
        item.setPrice(100.0);
        order.setItems(new ArrayList<>(List.of(item)));
        return order;
    }

    @Test
    void placeOrder_ShouldSetStatusPendingAndCalculateTotalPrice() {
        Order order = buildOrder();
        Order saved = buildOrder();
        saved.setId(1L);
        saved.setStatus("PENDING");
        saved.setTotalPrice(200.0);

        when(repo.save(any(Order.class))).thenReturn(saved);
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(i -> i.getArguments()[0]);

        Order result = orderService.placeOrder(order);

        assertEquals("PENDING", result.getStatus());
        assertEquals(200.0, result.getTotalPrice());
        verify(repo).save(any(Order.class));
        verify(outboxEventRepository).save(any(OutboxEvent.class));
        verify(notificationEventPublisher).notifyUser(any(Order.class), anyString(), anyString(), eq("ORDER_PLACED"));
        verify(notificationEventPublisher).notifyAdmin(any(Order.class), anyString(), anyString(), eq("ORDER_PLACED"));
    }

    @Test
    void placeOrder_ShouldSaveOutboxEvent_WithCorrectPayload() {
        Order order = buildOrder();
        Order saved = buildOrder();
        saved.setId(5L);
        saved.setTotalPrice(200.0);

        when(repo.save(any(Order.class))).thenReturn(saved);
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(i -> i.getArguments()[0]);

        orderService.placeOrder(order);

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());
        assertFalse(captor.getValue().isProcessed());
        assertTrue(captor.getValue().getPayload().contains("\"id\":5"));
    }

    @Test
    void placeOrder_ShouldNotSaveOutboxEvent_WhenPaymentModeIsRazorpay() {
        Order order = buildOrder();
        order.setPaymentMode("RAZORPAY");
        Order saved = buildOrder();
        saved.setId(6L);
        saved.setStatus("PENDING");
        saved.setPaymentMode("RAZORPAY");
        saved.setTotalPrice(200.0);

        when(repo.save(any(Order.class))).thenReturn(saved);

        Order result = orderService.placeOrder(order);

        assertEquals("PENDING", result.getStatus());
        verify(outboxEventRepository, never()).save(any(OutboxEvent.class));
        verify(notificationEventPublisher).notifyUser(any(Order.class), anyString(), anyString(), eq("ORDER_PLACED"));
        verify(notificationEventPublisher).notifyAdmin(any(Order.class), anyString(), anyString(), eq("ORDER_PLACED"));
    }

    @Test
    void placeOrder_ShouldThrowException_WhenItemsEmpty() {
        Order order = new Order();
        order.setUserId(1L);
        order.setItems(new ArrayList<>());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.placeOrder(order));

        assertEquals("Order must have at least one item", ex.getMessage());
        verify(repo, never()).save(any());
    }

    @Test
    void placeOrder_ShouldThrowException_WhenItemsNull() {
        Order order = new Order();
        order.setUserId(1L);
        order.setItems(null);

        assertThrows(RuntimeException.class, () -> orderService.placeOrder(order));
    }

    @Test
    void getOrderById_ShouldReturnOrder_WhenExists() {
        Order order = buildOrder();
        order.setId(1L);
        order.setItems(new ArrayList<>());
        when(repo.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.getOrderById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void getOrderById_ShouldThrowException_WhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.getOrderById(99L));

        assertEquals("Order not found", ex.getMessage());
    }

    @Test
    void getOrdersByUser_ShouldReturnOrders() {
        Order o1 = buildOrder();
        o1.setItems(new ArrayList<>());
        Order o2 = buildOrder();
        o2.setItems(new ArrayList<>());
        when(repo.findByUserId(1L)).thenReturn(Arrays.asList(o1, o2));

        List<Order> result = orderService.getOrdersByUser(1L);

        assertEquals(2, result.size());
    }

    @Test
    void getAllOrders_ShouldReturnOrders() {
        Order o1 = buildOrder();
        o1.setItems(new ArrayList<>());
        Order o2 = buildOrder();
        o2.setItems(new ArrayList<>());
        when(repo.findAll()).thenReturn(Arrays.asList(o1, o2));

        List<Order> result = orderService.getAllOrders();

        assertEquals(2, result.size());
    }

    @Test
    void updateStatus_ShouldUpdateAndReturnOrder() {
        Order order = buildOrder();
        order.setId(1L);
        order.setStatus("PENDING");
        when(repo.findById(1L)).thenReturn(Optional.of(order));
        when(repo.save(any(Order.class))).thenAnswer(i -> i.getArguments()[0]);

        Order result = orderService.updateStatus(1L, "CONFIRMED");

        assertEquals("CONFIRMED", result.getStatus());
        verify(notificationEventPublisher).notifyUser(any(Order.class), anyString(), anyString(), eq("ORDER_STATUS_UPDATED"));
    }

    @Test
    void updateStatus_ShouldThrowException_WhenOrderNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(99L, "CONFIRMED"));
    }
}
