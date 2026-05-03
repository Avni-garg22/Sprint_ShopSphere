package com.sprint.catalog_service.service;

import com.sprint.catalog_service.entity.Product;
import com.sprint.catalog_service.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repo;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private ProductService productService;

    @Test
    void getAllProducts_ShouldReturnFromCache_WhenCacheHit() {
        List<Product> cached = Arrays.asList(new Product(), new Product());
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("PRODUCTS")).thenReturn(cached);

        List<Product> result = productService.getAllProducts();

        assertEquals(2, result.size());
        verify(repo, never()).findAll();
    }

    @Test
    void getAllProducts_ShouldFetchFromDB_WhenCacheMiss() {
        List<Product> dbProducts = Arrays.asList(new Product(), new Product());
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("PRODUCTS")).thenReturn(null);
        when(repo.findAll()).thenReturn(dbProducts);

        List<Product> result = productService.getAllProducts();

        assertEquals(2, result.size());
        verify(repo).findAll();
        verify(valueOperations).set("PRODUCTS", dbProducts);
    }

    @Test
    void getProductById_ShouldReturnFromCache_WhenCacheHit() {
        Product cached = new Product();
        cached.setId(1L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("PRODUCT_1")).thenReturn(cached);

        Product result = productService.getProductById(1L);

        assertEquals(1L, result.getId());
        verify(repo, never()).findById(any());
    }

    @Test
    void getProductById_ShouldFetchFromDB_WhenCacheMiss() {
        Product product = new Product();
        product.setId(1L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("PRODUCT_1")).thenReturn(null);
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getProductById(1L);

        assertEquals(1L, result.getId());
        verify(repo).findById(1L);
        verify(valueOperations).set("PRODUCT_1", product);
    }

    @Test
    void getProductById_ShouldThrowException_WhenNotFound() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> productService.getProductById(99L));
    }

    @Test
    void addProduct_ShouldSaveAndInvalidateCache() {
        Product product = new Product();
        product.setName("Test");
        when(repo.save(product)).thenReturn(product);
        when(redisTemplate.delete("PRODUCTS")).thenReturn(true);

        Product result = productService.addProduct(product);

        assertNotNull(result);
        verify(repo).save(product);
        verify(redisTemplate).delete("PRODUCTS");
    }

    @Test
    void updateProduct_ShouldUpdateFieldsAndInvalidateCache() {
        Product existing = new Product();
        existing.setId(1L);
        existing.setName("Old Name");

        Product updated = new Product();
        updated.setName("New Name");
        updated.setPrice(200.0);
        updated.setDescription("New Desc");
        updated.setStock(10);
        updated.setImageUrl("https://img.com/new.jpg");
        updated.setFeatured(true);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);
        when(redisTemplate.delete(anyString())).thenReturn(true);

        Product result = productService.updateProduct(1L, updated);

        assertEquals("New Name", result.getName());
        assertEquals(200.0, result.getPrice());
        verify(redisTemplate).delete("PRODUCTS");
        verify(redisTemplate).delete("PRODUCT_1");
    }

    @Test
    void updateProduct_ShouldThrowException_WhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> productService.updateProduct(99L, new Product()));
    }

    @Test
    void deleteProduct_ShouldDeleteAndInvalidateCache() {
        when(redisTemplate.delete(anyString())).thenReturn(true);

        productService.deleteProduct(1L);

        verify(repo).deleteById(1L);
        verify(redisTemplate).delete("PRODUCTS");
        verify(redisTemplate).delete("PRODUCT_1");
    }

    @Test
    void searchProducts_ShouldReturnMatchingProducts() {
        List<Product> products = Arrays.asList(new Product());
        when(repo.findByNameContainingIgnoreCase("laptop")).thenReturn(products);

        List<Product> result = productService.searchProducts("laptop");

        assertEquals(1, result.size());
    }

    @Test
    void getByCategory_ShouldReturnProductsByCategory() {
        List<Product> products = Arrays.asList(new Product(), new Product());
        when(repo.findByCategoryId(1L)).thenReturn(products);

        List<Product> result = productService.getByCategory(1L);

        assertEquals(2, result.size());
    }

    @Test
    void getFeaturedProducts_ShouldReturnFeaturedProducts() {
        List<Product> products = Arrays.asList(new Product());
        when(repo.findByFeaturedTrue()).thenReturn(products);

        List<Product> result = productService.getFeaturedProducts();

        assertEquals(1, result.size());
    }
}
