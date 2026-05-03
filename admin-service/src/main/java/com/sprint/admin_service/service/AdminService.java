package com.sprint.admin_service.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sprint.admin_service.client.CatalogClient;
import com.sprint.admin_service.client.OrderClient;
import com.sprint.admin_service.dto.OrderDto;
import com.sprint.admin_service.dto.OrderItemDto;
import com.sprint.admin_service.dto.ProductDto;
import com.sprint.admin_service.entity.Order;
import com.sprint.admin_service.entity.Product;
import com.sprint.admin_service.repository.OrderRepository;
import com.sprint.admin_service.repository.ProductRepository;

@Service
public class AdminService {

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private CatalogClient catalogClient;

    @Autowired
    private OrderClient orderClient;

    public Product addProduct(Product product) {
        return productRepo.save(product);
    }

    public List<Product> getAllProducts() {
        try {
            // Fetch products from catalog-service and convert to local Product entities
            List<ProductDto> productDtos = catalogClient.getAllProducts();
            return productDtos.stream().map(dto -> {
                Product product = new Product();
                product.setId(dto.getId());
                product.setName(dto.getName());
                product.setPrice(dto.getPrice());
                product.setDescription(dto.getDescription());
                product.setStock(dto.getStock());
                product.setFeatured(dto.getFeatured());
                product.setImageUrl(dto.getImageUrl());
                return product;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching products from catalog-service: " + e.getMessage());
            // Fallback to local products
            return productRepo.findAll();
        }
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setDescription(updated.getDescription());
        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public List<OrderDto> getAllOrders() {
        try {
            return orderClient.getAllOrders();
        } catch (Exception e) {
            System.err.println("Error fetching orders from order-service: " + e.getMessage());
            // Fallback to local orders
            return orderRepo.findAll().stream()
                    .map(this::toOrderDto)
                    .collect(Collectors.toList());
        }
    }

    public OrderDto updateOrderStatus(Long id, String status) {
        try {
            // Update order status in order-service
            return orderClient.updateOrderStatus(id, status);
        } catch (Exception e) {
            System.err.println("Error updating order status in order-service: " + e.getMessage());
            // Fallback to local update
            Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            order.setStatus(status);
            return toOrderDto(orderRepo.save(order));
        }
    }

    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        try {
            // Fetch real data from catalog-service via Feign
            List<ProductDto> products = catalogClient.getAllProducts();
            dashboard.put("totalProducts", (long) products.size());
            
            // Fetch real data from order-service via Feign
            List<OrderDto> orders = orderClient.getAllOrders();
            dashboard.put("totalOrders", (long) orders.size());
            
            // Calculate total revenue from real orders
            double totalRevenue = orders.stream()
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            dashboard.put("totalRevenue", totalRevenue);
            
            // Count pending orders
            long pendingOrders = orders.stream()
                    .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                    .count();
            dashboard.put("pendingOrders", pendingOrders);
            
        } catch (Exception e) {
            // Fallback to local data if Feign calls fail
            System.err.println("Error fetching data from services: " + e.getMessage());
            dashboard.put("totalProducts", productRepo.count());
            dashboard.put("totalOrders", orderRepo.count());
            dashboard.put("totalRevenue", orderRepo.findAll().stream()
                    .mapToDouble(o -> o.getPrice() != null ? o.getPrice() : 0.0).sum());
            dashboard.put("pendingOrders", orderRepo.findAll().stream()
                    .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count());
        }
        
        return dashboard;
    }

    public Map<String, Object> getReports() {
        Map<String, Object> report = new HashMap<>();
        
        try {
            // Fetch real data from services
            List<ProductDto> products = catalogClient.getAllProducts();
            List<OrderDto> orders = orderClient.getAllOrders();
            
            report.put("totalOrders", (long) orders.size());
            report.put("totalProducts", (long) products.size());
            
            double totalRevenue = orders.stream()
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            report.put("totalRevenue", totalRevenue);
            
            long pendingOrders = orders.stream()
                    .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                    .count();
            report.put("pendingOrders", pendingOrders);
            
        } catch (Exception e) {
            // Fallback to local data
            System.err.println("Error fetching reports data: " + e.getMessage());
            report.put("totalOrders", orderRepo.count());
            report.put("totalProducts", productRepo.count());
            report.put("totalRevenue", orderRepo.findAll().stream()
                    .mapToDouble(o -> o.getPrice() != null ? o.getPrice() : 0.0).sum());
            report.put("pendingOrders", orderRepo.findAll().stream()
                    .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count());
        }
        
        return report;
    }

    private OrderDto toOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalPrice(order.getPrice());

        if (order.getProductName() != null || order.getQuantity() != null || order.getPrice() != null) {
            OrderItemDto item = new OrderItemDto();
            item.setProductName(order.getProductName());
            item.setQuantity(order.getQuantity());
            item.setPrice(order.getPrice());
            dto.setItems(List.of(item));
        } else {
            dto.setItems(List.of());
        }

        return dto;
    }
}
