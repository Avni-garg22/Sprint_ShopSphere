package com.sprint.order_service.dto;

import com.sprint.order_service.entity.Order;

public class OrderResponse {
    private String message;
    private Order order;

    public OrderResponse(String message, Order order) {
        this.message = message;
        this.order = order;
    }

    public String getMessage() { return message; }
    public Order getOrder() { return order; }
}
