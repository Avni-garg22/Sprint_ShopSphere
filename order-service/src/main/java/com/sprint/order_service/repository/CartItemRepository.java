package com.sprint.order_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sprint.order_service.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
