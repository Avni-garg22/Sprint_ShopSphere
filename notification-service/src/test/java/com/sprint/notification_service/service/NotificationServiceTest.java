package com.sprint.notification_service.service;

import com.sprint.notification_service.dto.NotificationEvent;
import com.sprint.notification_service.entity.Notification;
import com.sprint.notification_service.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository repository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void create_ShouldPersistUserNotification() {
        NotificationEvent event = new NotificationEvent();
        event.setRecipientType("USER");
        event.setRecipientId(1L);
        event.setTitle("Order placed");
        event.setMessage("Your order #1 has been placed.");
        event.setType("ORDER_PLACED");
        event.setOrderId(1L);

        Notification saved = new Notification();
        saved.setId(1L);
        saved.setRecipientType("USER");
        saved.setRecipientId(1L);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        Notification result = notificationService.create(event);

        assertNotNull(result);
        verify(repository).save(any(Notification.class));
    }

    @Test
    void create_ShouldNormalizeAdminRecipientType() {
        NotificationEvent event = new NotificationEvent();
        event.setRecipientType("admin");
        event.setTitle("New order");
        event.setMessage("Order #1 placed.");
        event.setType("ORDER_PLACED");

        Notification saved = new Notification();
        saved.setRecipientType("ADMIN");
        when(repository.save(any(Notification.class))).thenReturn(saved);

        Notification result = notificationService.create(event);

        assertEquals("ADMIN", result.getRecipientType());
    }

    @Test
    void processNotification_ShouldNotThrow() {
        assertDoesNotThrow(() -> notificationService.processNotification("some message"));
        assertDoesNotThrow(() -> notificationService.processNotification(null));
    }

    @Test
    void getUserNotifications_ShouldDelegateToRepository() {
        when(repository.findTop30ByRecipientTypeAndRecipientIdOrderByCreatedAtDesc("USER", 1L))
                .thenReturn(List.of());

        List<Notification> result = notificationService.getUserNotifications(1L);

        assertNotNull(result);
        verify(repository).findTop30ByRecipientTypeAndRecipientIdOrderByCreatedAtDesc("USER", 1L);
    }

    @Test
    void getAdminNotifications_ShouldDelegateToRepository() {
        when(repository.findTop30ByRecipientTypeOrderByCreatedAtDesc("ADMIN"))
                .thenReturn(List.of());

        List<Notification> result = notificationService.getAdminNotifications();

        assertNotNull(result);
        verify(repository).findTop30ByRecipientTypeOrderByCreatedAtDesc("ADMIN");
    }
}
