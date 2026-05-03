package com.sprint.auth_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sprint.auth_service.dto.RegisterRequest;
import com.sprint.auth_service.entity.User;
import com.sprint.auth_service.repository.UserRepository;

@Service
public class AuthService {

    private static final String ADMIN_EMAIL_DOMAIN = "@admin.com";

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    public User register(RegisterRequest request) {
        String role = request.getRole() != null ? request.getRole() : "CUSTOMER";
        validateAdminRegistrationEmail(role, request.getEmail());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEmail(request.getEmail());
        return repo.save(user);
    }

    public User login(String username) {
        return repo.findByUsername(username)
                .or(() -> repo.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validateAdminRegistrationEmail(String role, String email) {
        if (!"ADMIN".equals(role)) {
            return;
        }

        if (email == null || !email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN)) {
            throw new IllegalArgumentException("Admin accounts must use an @admin.com email address");
        }
    }
}
