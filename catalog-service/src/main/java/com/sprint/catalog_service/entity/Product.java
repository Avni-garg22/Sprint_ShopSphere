package com.sprint.catalog_service.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be 2-100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9 ._-]+$", message = "Product name contains invalid characters")
    private String name;

    @Positive(message = "Price must be greater than 0")
    private double price;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @PositiveOrZero(message = "Stock cannot be negative")
    private int stock;

    @Pattern(regexp = "^(https?://).+|^/uploads/product-images/.+|^/gateway/catalog/uploads/product-images/.+",
            message = "Image URL must be an external URL or uploaded product image path")
    private String imageUrl;

    private boolean featured;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "category_id")
    private Category category;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}
