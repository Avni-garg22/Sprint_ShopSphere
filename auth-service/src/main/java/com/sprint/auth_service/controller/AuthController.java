package com.sprint.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.sprint.auth_service.dto.LoginRequest;
import com.sprint.auth_service.dto.RegisterRequest;
import com.sprint.auth_service.entity.User;
import com.sprint.auth_service.security.JwtUtil;
import com.sprint.auth_service.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request) {
        User dbUser = service.login(request.getUsername());

        if (!encoder.matches(request.getPassword(), dbUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                dbUser.getId(),
                dbUser.getUsername(),
                dbUser.getEmail(),
                dbUser.getRole());
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
    }
}

