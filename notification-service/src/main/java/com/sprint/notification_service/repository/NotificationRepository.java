package com.sprint.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sprint.notification_service.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop30ByRecipientTypeOrderByCreatedAtDesc(String recipientType);

    List<Notification> findTop30ByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
            String recipientType, Long recipientId);
}
