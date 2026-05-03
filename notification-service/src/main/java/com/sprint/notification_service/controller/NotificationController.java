package com.sprint.notification_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sprint.notification_service.entity.Notification;
import com.sprint.notification_service.security.JwtUtil;
import com.sprint.notification_service.service.NotificationService;

@RestController
@RequestMapping("/notify")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public String test() {
        return "order successful";
    }

    @GetMapping("/me")
    public List<Notification> getMyNotifications(@RequestHeader("Authorization") String authorization) {
        String token = bearerToken(authorization);
        String role = jwtUtil.extractRole(token);
        if ("ADMIN".equals(role)) {
            return notificationService.getAdminNotifications();
        }

        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        return notificationService.getUserNotifications(userId);
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, @RequestHeader("Authorization") String authorization) {
        String token = bearerToken(authorization);
        String role = jwtUtil.extractRole(token);
        if ("ADMIN".equals(role)) {
            return notificationService.markAdminRead(id);
        }

        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        return notificationService.markUserRead(id, userId);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@RequestHeader("Authorization") String authorization) {
        String token = bearerToken(authorization);
        String role = jwtUtil.extractRole(token);
        if ("ADMIN".equals(role)) {
            notificationService.markAllAdminRead();
            return;
        }

        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        notificationService.markAllUserRead(userId);
    }

    private String bearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }
        return authorization.substring(7);
    }
}
