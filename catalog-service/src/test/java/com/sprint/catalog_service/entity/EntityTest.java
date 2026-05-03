package com.sprint.catalog_service.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    void product_ShouldSetAndGetAllFields() {
        Product p = new Product();
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Electronics");

        p.setId(1L);
        p.setName("iPhone 15");
        p.setPrice(999.99);
        p.setDescription("Apple iPhone");
        p.setStock(50);
        p.setImageUrl("https://example.com/img.jpg");
        p.setFeatured(true);
        p.setCategory(cat);

        assertEquals(1L, p.getId());
        assertEquals("iPhone 15", p.getName());
        assertEquals(999.99, p.getPrice());
        assertEquals("Apple iPhone", p.getDescription());
        assertEquals(50, p.getStock());
        assertEquals("https://example.com/img.jpg", p.getImageUrl());
        assertTrue(p.isFeatured());
        assertEquals("Electronics", p.getCategory().getName());
    }

    @Test
    void product_ShouldHaveDefaultConstructor() {
        Product p = new Product();
        assertNotNull(p);
        assertNull(p.getId());
        assertNull(p.getName());
        assertFalse(p.isFeatured());
    }

    @Test
    void category_ShouldSetAndGetAllFields() {
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Electronics");

        assertEquals(1L, cat.getId());
        assertEquals("Electronics", cat.getName());
    }

    @Test
    void category_ShouldHaveDefaultConstructor() {
        Category cat = new Category();
        assertNotNull(cat);
        assertNull(cat.getId());
        assertNull(cat.getName());
    }

    @Test
    void product_ShouldSetFeaturedFalse() {
        Product p = new Product();
        p.setFeatured(false);
        assertFalse(p.isFeatured());
    }

    @Test
    void product_ShouldSetNullCategory() {
        Product p = new Product();
        p.setCategory(null);
        assertNull(p.getCategory());
    }

    @Test
    void product_ShouldUpdateFields() {
        Product p = new Product();
        p.setName("Old Name");
        p.setPrice(100.0);
        p.setStock(10);

        p.setName("New Name");
        p.setPrice(200.0);
        p.setStock(20);

        assertEquals("New Name", p.getName());
        assertEquals(200.0, p.getPrice());
        assertEquals(20, p.getStock());
    }
}
