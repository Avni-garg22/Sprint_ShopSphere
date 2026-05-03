package com.sprint.catalog_service.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprint.catalog_service.entity.Category;
import com.sprint.catalog_service.repository.CategoryRepository;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository repo;

    public List<Category> getAllCategories() {
        return repo.findAll();
    }

    public Category getCategoryById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category addCategory(Category category) {
        return repo.save(category);
    }

    public Category updateCategory(Long id, Category updated) {
        Category existing = getCategoryById(id);
        existing.setName(updated.getName());
        return repo.save(existing);
    }

    public void deleteCategory(Long id) {
        repo.deleteById(id);
    }
}
