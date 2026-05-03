package com.sprint.catalog_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sprint.catalog_service.entity.Product;
import com.sprint.catalog_service.service.ProductImageStorageService;
import com.sprint.catalog_service.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private ProductImageStorageService imageStorageService;

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) Long categoryId) {
        if (search != null) return service.searchProducts(search);
        if (categoryId != null) return service.getByCategory(categoryId);
        return service.getAllProducts();
    }

    @GetMapping("/featured")
    public List<Product> getFeatured() {
        return service.getFeaturedProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return service.addProduct(product);
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadProductImage(@RequestParam("file") MultipartFile file) {
        return Map.of("imageUrl", imageStorageService.store(file));
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }
}
