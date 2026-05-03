package com.sprint.catalog_service.controller;

import com.sprint.catalog_service.entity.Product;
import com.sprint.catalog_service.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductControllerTest {

    @Mock
    private ProductService service;

    private ProductController productController;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        productController = new ProductController();
        var field = ProductController.class.getDeclaredField("service");
        field.setAccessible(true);
        field.set(productController, service);
    }

    @Test
    void getAllProducts_ShouldReturnAllProducts_WhenNoParams() {
        List<Product> products = Arrays.asList(new Product(), new Product());
        when(service.getAllProducts()).thenReturn(products);

        List<Product> result = productController.getAllProducts(null, null);

        assertEquals(2, result.size());
        verify(service).getAllProducts();
    }

    @Test
    void getAllProducts_ShouldSearchByName_WhenSearchParamProvided() {
        List<Product> products = Arrays.asList(new Product());
        when(service.searchProducts("iphone")).thenReturn(products);

        List<Product> result = productController.getAllProducts("iphone", null);

        assertEquals(1, result.size());
        verify(service).searchProducts("iphone");
        verify(service, never()).getAllProducts();
    }

    @Test
    void getAllProducts_ShouldFilterByCategory_WhenCategoryIdProvided() {
        List<Product> products = Arrays.asList(new Product(), new Product());
        when(service.getByCategory(1L)).thenReturn(products);

        List<Product> result = productController.getAllProducts(null, 1L);

        assertEquals(2, result.size());
        verify(service).getByCategory(1L);
        verify(service, never()).getAllProducts();
    }

    @Test
    void getAllProducts_ShouldReturnEmpty_WhenNoProducts() {
        when(service.getAllProducts()).thenReturn(Collections.emptyList());

        List<Product> result = productController.getAllProducts(null, null);

        assertTrue(result.isEmpty());
    }

    @Test
    void getFeatured_ShouldReturnFeaturedProducts() {
        List<Product> featured = Arrays.asList(new Product());
        when(service.getFeaturedProducts()).thenReturn(featured);

        List<Product> result = productController.getFeatured();

        assertEquals(1, result.size());
        verify(service).getFeaturedProducts();
    }

    @Test
    void getProductById_ShouldReturnProduct() {
        Product product = new Product();
        product.setId(1L);
        when(service.getProductById(1L)).thenReturn(product);

        Product result = productController.getProductById(1L);

        assertEquals(1L, result.getId());
        verify(service).getProductById(1L);
    }

    @Test
    void getProductById_ShouldThrowException_WhenNotFound() {
        when(service.getProductById(99L)).thenThrow(new RuntimeException("Product not found"));

        assertThrows(RuntimeException.class, () -> productController.getProductById(99L));
    }

    @Test
    void addProduct_ShouldReturnSavedProduct() {
        Product product = new Product();
        product.setName("Samsung S24");
        when(service.addProduct(product)).thenReturn(product);

        Product result = productController.addProduct(product);

        assertEquals("Samsung S24", result.getName());
        verify(service).addProduct(product);
    }

    @Test
    void updateProduct_ShouldReturnUpdatedProduct() {
        Product product = new Product();
        product.setName("Updated Name");
        when(service.updateProduct(1L, product)).thenReturn(product);

        Product result = productController.updateProduct(1L, product);

        assertEquals("Updated Name", result.getName());
        verify(service).updateProduct(1L, product);
    }

    @Test
    void deleteProduct_ShouldCallService() {
        productController.deleteProduct(1L);
        verify(service).deleteProduct(1L);
    }
}
