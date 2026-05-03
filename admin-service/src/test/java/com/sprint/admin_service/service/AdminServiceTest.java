package com.sprint.admin_service.service;

import com.sprint.admin_service.client.CatalogClient;
import com.sprint.admin_service.client.OrderClient;
import com.sprint.admin_service.dto.OrderDto;
import com.sprint.admin_service.entity.Order;
import com.sprint.admin_service.entity.Product;
import com.sprint.admin_service.repository.OrderRepository;
import com.sprint.admin_service.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ProductRepository productRepo;

    @Mock
    private OrderRepository orderRepo;

    @Mock
    private CatalogClient catalogClient;

    @Mock
    private OrderClient orderClient;

    @InjectMocks
    private AdminService adminService;

    @Test
    void addProduct_ShouldSaveAndReturnProduct() {
        Product product = new Product();
        product.setName("iPhone 15");
        product.setPrice(999.99);
        when(productRepo.save(product)).thenReturn(product);

        Product result = adminService.addProduct(product);

        assertNotNull(result);
        assertEquals("iPhone 15", result.getName());
        verify(productRepo).save(product);
    }

    @Test
    void getAllProducts_ShouldReturnAllProducts() {
        List<Product> products = Arrays.asList(new Product(), new Product(), new Product());
        when(catalogClient.getAllProducts()).thenThrow(new RuntimeException("catalog unavailable"));
        when(productRepo.findAll()).thenReturn(products);

        List<Product> result = adminService.getAllProducts();

        assertEquals(3, result.size());
        verify(productRepo).findAll();
    }

    @Test
    void getProductById_ShouldReturnProduct_WhenExists() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Samsung S24");
        when(productRepo.findById(1L)).thenReturn(Optional.of(product));

        Product result = adminService.getProductById(1L);

        assertEquals(1L, result.getId());
        assertEquals("Samsung S24", result.getName());
    }

    @Test
    void getProductById_ShouldThrowException_WhenNotFound() {
        when(productRepo.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminService.getProductById(99L));

        assertEquals("Product not found", ex.getMessage());
    }

    @Test
    void updateProduct_ShouldUpdateFieldsAndReturn() {
        Product existing = new Product();
        existing.setId(1L);
        existing.setName("Old Name");
        existing.setPrice(100.0);
        existing.setDescription("Old Desc");

        Product updated = new Product();
        updated.setName("New Name");
        updated.setPrice(200.0);
        updated.setDescription("New Desc");

        when(productRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepo.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

        Product result = adminService.updateProduct(1L, updated);

        assertEquals("New Name", result.getName());
        assertEquals(200.0, result.getPrice());
        assertEquals("New Desc", result.getDescription());
        verify(productRepo).save(existing);
    }

    @Test
    void updateProduct_ShouldThrowException_WhenNotFound() {
        when(productRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> adminService.updateProduct(99L, new Product()));
    }

    @Test
    void deleteProduct_ShouldCallDeleteById() {
        adminService.deleteProduct(1L);
        verify(productRepo).deleteById(1L);
    }

    @Test
    void getAllOrders_ShouldReturnAllOrders() {
        List<Order> orders = Arrays.asList(new Order(), new Order());
        when(orderClient.getAllOrders()).thenThrow(new RuntimeException("order service unavailable"));
        when(orderRepo.findAll()).thenReturn(orders);

        List<OrderDto> result = adminService.getAllOrders();

        assertEquals(2, result.size());
        verify(orderRepo).findAll();
    }

    @Test
    void updateOrderStatus_ShouldUpdateAndReturn() {
        Order order = new Order();
        order.setId(1L);
        order.setStatus("PENDING");
        when(orderClient.updateOrderStatus(1L, "CONFIRMED")).thenThrow(new RuntimeException("order service unavailable"));
        when(orderRepo.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepo.save(any(Order.class))).thenAnswer(i -> i.getArguments()[0]);

        OrderDto result = adminService.updateOrderStatus(1L, "CONFIRMED");

        assertEquals("CONFIRMED", result.getStatus());
        verify(orderRepo).save(order);
    }

    @Test
    void updateOrderStatus_ShouldThrowException_WhenOrderNotFound() {
        when(orderClient.updateOrderStatus(99L, "CONFIRMED")).thenThrow(new RuntimeException("order service unavailable"));
        when(orderRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> adminService.updateOrderStatus(99L, "CONFIRMED"));
    }

    @Test
    void getDashboard_ShouldReturnTotalProductsAndOrders() {
        when(catalogClient.getAllProducts()).thenThrow(new RuntimeException("catalog unavailable"));
        when(productRepo.count()).thenReturn(10L);
        when(orderRepo.count()).thenReturn(25L);

        Map<String, Object> result = adminService.getDashboard();

        assertEquals(10L, result.get("totalProducts"));
        assertEquals(25L, result.get("totalOrders"));
    }

    @Test
    void getReports_ShouldReturnReportData() {
        when(catalogClient.getAllProducts()).thenThrow(new RuntimeException("catalog unavailable"));
        when(productRepo.count()).thenReturn(5L);
        when(orderRepo.count()).thenReturn(15L);

        Map<String, Object> result = adminService.getReports();

        assertEquals(5L, result.get("totalProducts"));
        assertEquals(15L, result.get("totalOrders"));
    }

    @Test
    void getDashboard_ShouldReturnZero_WhenNoData() {
        when(catalogClient.getAllProducts()).thenThrow(new RuntimeException("catalog unavailable"));
        when(productRepo.count()).thenReturn(0L);
        when(orderRepo.count()).thenReturn(0L);

        Map<String, Object> result = adminService.getDashboard();

        assertEquals(0L, result.get("totalProducts"));
        assertEquals(0L, result.get("totalOrders"));
    }
}
