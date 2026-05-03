package com.sprint.catalog_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sprint.catalog_service.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByFeaturedTrue();
}
