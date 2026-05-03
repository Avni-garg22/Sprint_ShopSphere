package com.sprint.admin_service.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.sprint.admin_service.dto.OrderDto;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/orders")
    List<OrderDto> getAllOrders();

    @PutMapping("/orders/{id}/status")
    OrderDto updateOrderStatus(@PathVariable Long id, @RequestParam String status);
}
