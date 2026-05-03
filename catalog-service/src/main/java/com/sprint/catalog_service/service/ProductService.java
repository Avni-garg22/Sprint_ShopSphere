package com.sprint.catalog_service.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprint.catalog_service.entity.Category;
import com.sprint.catalog_service.entity.Product;
import com.sprint.catalog_service.repository.CategoryRepository;
import com.sprint.catalog_service.repository.ProductRepository;

@Service
@Transactional
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository repo;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String KEY = "PRODUCTS";

    // ── helpers ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private <T> T redisGet(String key) {
        try {
            return (T) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("Redis GET failed for key '{}': {}", key, e.getMessage());
            return null;
        }
    }

    private void redisSet(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.warn("Redis SET failed for key '{}': {}", key, e.getMessage());
        }
    }

    private void redisDel(String... keys) {
        try {
            for (String key : keys) redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis DELETE failed: {}", e.getMessage());
        }
    }

    // ── public API ────────────────────────────────────────────────────────────

    public List<Product> getAllProducts() {
        List<Product> cached = redisGet(KEY);
        if (cached != null) return cached;
        List<Product> products = repo.findAll();
        redisSet(KEY, products);
        return products;
    }

    public Product getProductById(Long id) {
        String key = "PRODUCT_" + id;
        Product cached = redisGet(key);
        if (cached != null) return cached;
        Product product = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        redisSet(key, product);
        return product;
    }

    public Product addProduct(Product product) {
        Category category = resolveCategory(product.getCategory());
        product.setCategory(category);
        Product saved = repo.save(product);
        redisDel(KEY);
        return saved;
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setDescription(updated.getDescription());
        existing.setStock(updated.getStock());
        existing.setImageUrl(updated.getImageUrl());
        existing.setFeatured(updated.isFeatured());
        existing.setCategory(resolveCategory(updated.getCategory()));
        Product saved = repo.save(existing);
        redisDel(KEY, "PRODUCT_" + id);
        return saved;
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
        redisDel(KEY, "PRODUCT_" + id);
    }

    public List<Product> searchProducts(String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getByCategory(Long categoryId) {
        return repo.findByCategoryId(categoryId);
    }

    public List<Product> getFeaturedProducts() {
        return repo.findByFeaturedTrue();
    }

    private Category resolveCategory(Category category) {
        if (category == null) {
            return null;
        }
        if (category.getId() != null) {
            // Load managed category from DB if ID exists
            return categoryRepo.findById(category.getId())
                    .orElseThrow(() -> new RuntimeException("Category with ID " + category.getId() + " not found"));
        }
        // Save new category if no ID (new category)
        return categoryRepo.save(category);
    }
}
