package com.sprint.payment_service.repository;

import com.sprint.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findTopByOrderIdAndRazorpayOrderIdOrderByIdDesc(Long orderId, String razorpayOrderId);
}
