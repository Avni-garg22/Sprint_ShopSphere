package com.sprint.catalog_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sprint.catalog_service.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
