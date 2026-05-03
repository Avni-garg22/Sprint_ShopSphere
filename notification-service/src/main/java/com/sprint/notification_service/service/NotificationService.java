package com.sprint.notification_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sprint.notification_service.dto.NotificationEvent;
import com.sprint.notification_service.entity.Notification;
import com.sprint.notification_service.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Notification create(NotificationEvent event) {
        Notification notification = new Notification();
        notification.setRecipientType(normalizeRecipientType(event.getRecipientType()));
        notification.setRecipientId(event.getRecipientId());
        notification.setTitle(event.getTitle());
        notification.setMessage(event.getMessage());
        notification.setType(event.getType());
        notification.setOrderId(event.getOrderId());
        notification.setStatus(event.getStatus());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return repository.save(notification);
    }

    /** Legacy plain-text message support (kept for backward compatibility). */
    public void processNotification(String message) {
        // no-op for plain-text messages; structured events are handled by create()
    }

    public List<Notification> getUserNotifications(Long userId) {
        return repository.findTop30ByRecipientTypeAndRecipientIdOrderByCreatedAtDesc("USER", userId);
    }

    public List<Notification> getAdminNotifications() {
        return repository.findTop30ByRecipientTypeOrderByCreatedAtDesc("ADMIN");
    }

    @Transactional
    public Notification markRead(Long id) {
        Notification notification = findById(id);
        notification.setRead(true);
        return repository.save(notification);
    }

    @Transactional
    public Notification markUserRead(Long id, Long userId) {
        Notification notification = findById(id);
        if (!"USER".equals(notification.getRecipientType()) || !userId.equals(notification.getRecipientId())) {
            throw notFound();
        }
        notification.setRead(true);
        return repository.save(notification);
    }

    @Transactional
    public Notification markAdminRead(Long id) {
        Notification notification = findById(id);
        if (!"ADMIN".equals(notification.getRecipientType())) {
            throw notFound();
        }
        notification.setRead(true);
        return repository.save(notification);
    }

    @Transactional
    public void markAllUserRead(Long userId) {
        List<Notification> list = getUserNotifications(userId);
        list.forEach(n -> n.setRead(true));
        repository.saveAll(list);
    }

    @Transactional
    public void markAllAdminRead() {
        List<Notification> list = getAdminNotifications();
        list.forEach(n -> n.setRead(true));
        repository.saveAll(list);
    }

    private String normalizeRecipientType(String recipientType) {
        String normalized = recipientType == null ? "" : recipientType.trim().toUpperCase();
        return "ADMIN".equals(normalized) ? "ADMIN" : "USER";
    }

    private Notification findById(Long id) {
        return repository.findById(id).orElseThrow(this::notFound);
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
    }
}
