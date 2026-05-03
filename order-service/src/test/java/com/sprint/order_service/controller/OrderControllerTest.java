package com.sprint.order_service.controller;

import com.sprint.order_service.dto.OrderResponse;
import com.sprint.order_service.entity.Cart;
import com.sprint.order_service.entity.CartItem;
import com.sprint.order_service.entity.Order;
import com.sprint.order_service.entity.OrderItem;
import com.sprint.order_service.service.CartService;
import com.sprint.order_service.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private CartService cartService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void getCart_ShouldReturnCart() {
        Cart cart = new Cart();
        cart.setUserId(1L);
        cart.setItems(new ArrayList<>());
        when(cartService.getCart(1L)).thenReturn(cart);

        Cart result = orderController.getCart(1L);

        assertEquals(1L, result.getUserId());
        verify(cartService).getCart(1L);
    }

    @Test
    void addToCart_ShouldReturnUpdatedCart() {
        Cart cart = new Cart();
        cart.setUserId(1L);
        CartItem item = new CartItem();
        when(cartService.addItem(eq(1L), any(CartItem.class))).thenReturn(cart);

        Cart result = orderController.addToCart(1L, item);

        assertNotNull(result);
        verify(cartService).addItem(1L, item);
    }

    @Test
    void updateCartItem_ShouldReturnUpdatedItem() {
        CartItem item = new CartItem();
        item.setQuantity(5);
        when(cartService.updateItem(1L, 5)).thenReturn(item);

        CartItem result = orderController.updateCartItem(1L, 5);

        assertEquals(5, result.getQuantity());
    }

    @Test
    void removeCartItem_ShouldCallService() {
        orderController.removeCartItem(1L);
        verify(cartService).removeItem(1L);
    }

    @Test
    void placeOrder_ShouldReturnOrderResponse() {
        Order order = new Order();
        order.setUserId(1L);
        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setQuantity(1);
        item.setPrice(100.0);
        order.setItems(new ArrayList<>(List.of(item)));

        Order placed = new Order();
        placed.setId(1L);
        placed.setStatus("PENDING");
        placed.setTotalPrice(100.0);
        placed.setItems(new ArrayList<>());

        when(orderService.placeOrder(any(Order.class))).thenReturn(placed);

        OrderResponse response = orderController.placeOrder(order);

        assertNotNull(response);
        assertEquals("Order placed successfully! Your order is now PENDING.", response.getMessage());
        assertEquals(1L, response.getOrder().getId());
    }

    @Test
    void getOrder_ShouldReturnOrder() {
        Order order = new Order();
        order.setId(1L);
        order.setItems(new ArrayList<>());
        when(orderService.getOrderById(1L)).thenReturn(order);

        Order result = orderController.getOrder(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void getAllOrders_ShouldReturnOrders() {
        Order o1 = new Order();
        o1.setItems(new ArrayList<>());
        Order o2 = new Order();
        o2.setItems(new ArrayList<>());
        when(orderService.getAllOrders()).thenReturn(Arrays.asList(o1, o2));

        List<Order> result = orderController.getAllOrders();

        assertEquals(2, result.size());
    }

    @Test
    void getMyOrders_ShouldReturnUserOrders() {
        Order o1 = new Order();
        o1.setItems(new ArrayList<>());
        Order o2 = new Order();
        o2.setItems(new ArrayList<>());
        when(orderService.getOrdersByUser(1L)).thenReturn(Arrays.asList(o1, o2));

        List<Order> result = orderController.getMyOrders(1L);

        assertEquals(2, result.size());
    }

    @Test
    void updateOrderStatus_ShouldReturnUpdatedOrder() {
        Order order = new Order();
        order.setId(1L);
        order.setStatus("CONFIRMED");
        when(orderService.updateStatus(1L, "CONFIRMED")).thenReturn(order);

        Order result = orderController.updateOrderStatus(1L, "CONFIRMED");

        assertEquals("CONFIRMED", result.getStatus());
    }
}
