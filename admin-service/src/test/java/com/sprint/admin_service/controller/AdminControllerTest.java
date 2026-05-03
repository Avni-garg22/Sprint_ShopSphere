package com.sprint.admin_service.controller;

import com.sprint.admin_service.dto.OrderDto;
import com.sprint.admin_service.entity.Product;
import com.sprint.admin_service.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminControllerTest {

    @Mock
    private AdminService service;

    private AdminController adminController;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        adminController = new AdminController();
        var field = AdminController.class.getDeclaredField("service");
        field.setAccessible(true);
        field.set(adminController, service);
    }

    @Test
    void getDashboard_ShouldReturnDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalProducts", 10L);
        dashboard.put("totalOrders", 25L);
        when(service.getDashboard()).thenReturn(dashboard);

        Map<String, Object> result = adminController.getDashboard();

        assertEquals(10L, result.get("totalProducts"));
        assertEquals(25L, result.get("totalOrders"));
    }

    @Test
    void getReports_ShouldReturnReportData() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalOrders", 15L);
        when(service.getReports()).thenReturn(report);

        Map<String, Object> result = adminController.getReports();

        assertEquals(15L, result.get("totalOrders"));
    }

    @Test
    void addProduct_ShouldReturnSavedProduct() {
        Product product = new Product();
        product.setName("iPhone 15");
        when(service.addProduct(product)).thenReturn(product);

        Product result = adminController.addProduct(product);

        assertEquals("iPhone 15", result.getName());
        verify(service).addProduct(product);
    }

    @Test
    void getProducts_ShouldReturnAllProducts() {
        List<Product> products = Arrays.asList(new Product(), new Product());
        when(service.getAllProducts()).thenReturn(products);

        List<Product> result = adminController.getProducts();

        assertEquals(2, result.size());
    }

    @Test
    void getProduct_ShouldReturnProductById() {
        Product product = new Product();
        product.setId(1L);
        when(service.getProductById(1L)).thenReturn(product);

        Product result = adminController.getProduct(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void updateProduct_ShouldReturnUpdatedProduct() {
        Product product = new Product();
        product.setName("Updated");
        when(service.updateProduct(1L, product)).thenReturn(product);

        Product result = adminController.updateProduct(1L, product);

        assertEquals("Updated", result.getName());
    }

    @Test
    void deleteProduct_ShouldCallService() {
        adminController.deleteProduct(1L);
        verify(service).deleteProduct(1L);
    }

    @Test
    void getAllOrders_ShouldReturnAllOrders() {
        List<OrderDto> orders = Arrays.asList(new OrderDto(), new OrderDto());
        when(service.getAllOrders()).thenReturn(orders);

        List<OrderDto> result = adminController.getAllOrders();

        assertEquals(2, result.size());
    }

    @Test
    void updateOrderStatus_ShouldReturnUpdatedOrder() {
        OrderDto order = new OrderDto();
        order.setStatus("CONFIRMED");
        when(service.updateOrderStatus(1L, "CONFIRMED")).thenReturn(order);

        OrderDto result = adminController.updateOrderStatus(1L, "CONFIRMED");

        assertEquals("CONFIRMED", result.getStatus());
    }
}
