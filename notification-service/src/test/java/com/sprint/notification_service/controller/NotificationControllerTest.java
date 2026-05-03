package com.sprint.notification_service.controller;

import com.sprint.notification_service.entity.Notification;
import com.sprint.notification_service.service.NotificationService;
import com.sprint.notification_service.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private NotificationController notificationController;

    @Test
    void test_ShouldReturnServiceRunningMessage() {
        String result = notificationController.test();
        assertEquals("order successful", result);
    }

    @Test
    void getMyNotifications_ShouldReturnAdminNotifications_WhenRoleIsAdmin() {
        String token = "valid.jwt.token";
        when(jwtUtil.extractRole(token)).thenReturn("ADMIN");
        when(notificationService.getAdminNotifications()).thenReturn(List.of());

        List<Notification> result = notificationController.getMyNotifications("Bearer " + token);

        assertNotNull(result);
        verify(notificationService).getAdminNotifications();
    }

    @Test
    void getMyNotifications_ShouldReturnUserNotifications_WhenRoleIsUser() {
        String token = "valid.jwt.token";
        when(jwtUtil.extractRole(token)).thenReturn("USER");
        when(jwtUtil.extractUserId(token)).thenReturn(1L);
        when(notificationService.getUserNotifications(1L)).thenReturn(List.of());

        List<Notification> result = notificationController.getMyNotifications("Bearer " + token);

        assertNotNull(result);
        verify(notificationService).getUserNotifications(1L);
    }
}
