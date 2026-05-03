package com.sprint.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.sprint.order_service.dto.Product;

@FeignClient(name = "admin-service")
public interface ProductClient {

    @GetMapping("/admin/products/{id}")
    Product getProduct(@PathVariable Long id);

    @DeleteMapping("/admin/products/{id}")
    void deleteProduct(@PathVariable Long id);
}