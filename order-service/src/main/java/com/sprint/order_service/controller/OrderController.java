package com.sprint.order_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sprint.order_service.dto.OrderResponse;
import com.sprint.order_service.entity.Cart;
import com.sprint.order_service.entity.CartItem;
import com.sprint.order_service.entity.Order;
import com.sprint.order_service.service.CartService;
import com.sprint.order_service.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    // Cart APIs
    @GetMapping("/cart")
    public Cart getCart(@RequestParam Long userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/cart/items")
    public Cart addToCart(@RequestParam Long userId, @RequestBody CartItem item) {
        return cartService.addItem(userId, item);
    }

    @PutMapping("/cart/items/{id}")
    public CartItem updateCartItem(@PathVariable Long id, @RequestParam int quantity) {
        return cartService.updateItem(id, quantity);
    }

    @DeleteMapping("/cart/items/{id}")
    public void removeCartItem(@PathVariable Long id) {
        cartService.removeItem(id);
    }

    @DeleteMapping("/cart")
    public void clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
    }

    // Order APIs
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping("/place")
    public OrderResponse placeOrder(@Valid @RequestBody Order order) {
        Order placed = orderService.placeOrder(order);
        return new OrderResponse("Order placed successfully! Your order is now PENDING.", placed);
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/my")
    public List<Order> getMyOrders(@RequestParam Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }
}
