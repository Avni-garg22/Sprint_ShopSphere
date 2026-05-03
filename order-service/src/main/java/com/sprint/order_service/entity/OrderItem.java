package com.sprint.order_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be positive")
    private Long productId;

    @NotBlank(message = "Product name is required")
    @Pattern(regexp = "^[a-zA-Z0-9 ._-]{2,100}$", message = "Product name must be 2-100 alphanumeric characters")
    private String productName;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    @Positive(message = "Price must be greater than 0")
    private double price;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public OrderItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}
