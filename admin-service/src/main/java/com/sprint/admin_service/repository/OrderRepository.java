package com.sprint.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sprint.admin_service.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}