package com.sprint.auth_service.service;

import com.sprint.auth_service.dto.RegisterRequest;
import com.sprint.auth_service.entity.User;
import com.sprint.auth_service.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository repo;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldSaveUserWithEncodedPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("Test123");
        request.setRole("USER");
        request.setEmail("test@gmail.com");

        when(encoder.encode("Test123")).thenReturn("encodedPassword");
        when(repo.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User result = authService.register(request);

        assertEquals("testuser", result.getUsername());
        assertEquals("encodedPassword", result.getPassword());
        assertEquals("USER", result.getRole());
        assertEquals("test@gmail.com", result.getEmail());
        verify(encoder).encode("Test123");
        verify(repo).save(any(User.class));
    }

    @Test
    void register_ShouldDefaultRoleToCustomer_WhenRoleIsNull() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("Test123");
        request.setRole(null);
        request.setEmail("test@yahoo.com");

        when(encoder.encode(anyString())).thenReturn("encodedPassword");
        when(repo.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User result = authService.register(request);

        assertEquals("CUSTOMER", result.getRole());
    }

    @Test
    void register_ShouldAllowAdmin_WhenEmailUsesAdminDomain() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("adminuser");
        request.setPassword("Test123");
        request.setRole("ADMIN");
        request.setEmail("admin@admin.com");

        when(encoder.encode("Test123")).thenReturn("encodedPassword");
        when(repo.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User result = authService.register(request);

        assertEquals("ADMIN", result.getRole());
        assertEquals("admin@admin.com", result.getEmail());
        verify(repo).save(any(User.class));
    }

    @Test
    void register_ShouldRejectAdmin_WhenEmailDoesNotUseAdminDomain() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("adminuser");
        request.setPassword("Test123");
        request.setRole("ADMIN");
        request.setEmail("admin@gmail.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register(request));

        assertEquals("Admin accounts must use an @admin.com email address", ex.getMessage());
        verifyNoInteractions(encoder);
        verify(repo, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnUser_WhenUsernameExists() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        when(repo.findByUsername("testuser")).thenReturn(Optional.of(user));

        User result = authService.login("testuser");

        assertEquals("testuser", result.getUsername());
        verify(repo).findByUsername("testuser");
    }

    @Test
    void login_ShouldReturnUser_WhenEmailExists() {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        when(repo.findByUsername("test@gmail.com")).thenReturn(Optional.empty());
        when(repo.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));

        User result = authService.login("test@gmail.com");

        assertEquals("testuser", result.getUsername());
        verify(repo).findByUsername("test@gmail.com");
        verify(repo).findByEmail("test@gmail.com");
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        when(repo.findByUsername("unknown")).thenReturn(Optional.empty());
        when(repo.findByEmail("unknown")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login("unknown"));

        assertEquals("User not found", ex.getMessage());
    }
}
