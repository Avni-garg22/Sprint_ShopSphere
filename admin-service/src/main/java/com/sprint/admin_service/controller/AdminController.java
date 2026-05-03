package com.sprint.admin_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sprint.admin_service.dto.OrderDto;
import com.sprint.admin_service.entity.Product;
import com.sprint.admin_service.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService service;

    // Dashboard
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {
        return service.getDashboard();
    }

    // Reports
    @GetMapping("/reports")
    public Map<String, Object> getReports() {
        return service.getReports();
    }

    // Product Management
    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        return service.addProduct(product);
    }

    @GetMapping("/products")
    public List<Product> getProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public Product getProduct(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }

    // Order Management
    @GetMapping("/orders")
    public List<OrderDto> getAllOrders() {
        return service.getAllOrders();
    }

    @PutMapping("/orders/{id}/status")
    public OrderDto updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateOrderStatus(id, status);
    }
}
