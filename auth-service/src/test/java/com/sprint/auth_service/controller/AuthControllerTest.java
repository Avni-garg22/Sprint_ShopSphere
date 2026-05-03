package com.sprint.auth_service.controller;

import com.sprint.auth_service.dto.LoginRequest;
import com.sprint.auth_service.dto.RegisterRequest;
import com.sprint.auth_service.entity.User;
import com.sprint.auth_service.security.JwtUtil;
import com.sprint.auth_service.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock private AuthService service;
    @Mock private JwtUtil jwtUtil;
    @Mock private PasswordEncoder encoder;

    private AuthController authController;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        authController = new AuthController();
        setField("service", service);
        setField("jwtUtil", jwtUtil);
        setField("encoder", encoder);
    }

    private void setField(String name, Object value) throws Exception {
        var field = AuthController.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(authController, value);
    }

    @Test
    void signup_ShouldReturnUser() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setPassword("Test123");
        req.setEmail("test@outlook.com");
        req.setRole("USER");

        User user = new User();
        user.setUsername("testuser");
        when(service.register(req)).thenReturn(user);

        ResponseEntity<User> response = authController.signup(req);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("testuser", response.getBody().getUsername());
    }

    @Test
    void login_ShouldReturnTokenInHeader_WhenCredentialsValid() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("Test123");

        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setRole("USER");
        user.setEmail("test@outlook.com");

        when(service.login("testuser")).thenReturn(user);
        when(encoder.matches("Test123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "testuser", "test@outlook.com", "USER")).thenReturn("jwt-token");

        ResponseEntity<Void> response = authController.login(req);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getHeaders().getFirst("Authorization").contains("jwt-token"));
    }

    @Test
    void login_ShouldThrowException_WhenPasswordInvalid() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("wrongpass");

        User user = new User();
        user.setPassword("encodedPassword");
        when(service.login("testuser")).thenReturn(user);
        when(encoder.matches("wrongpass", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authController.login(req));
    }
}
