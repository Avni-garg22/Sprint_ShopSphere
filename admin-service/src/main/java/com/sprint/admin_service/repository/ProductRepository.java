package com.sprint.admin_service.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.sprint.admin_service.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}