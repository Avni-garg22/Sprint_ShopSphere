package com.sprint.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be 3-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be at least 6 characters")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9]).+$", message = "Password must contain at least one uppercase letter and one number")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(
        regexp = "^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$",
        message = "Enter a valid email address"
    )
    private String email;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(USER|ADMIN|CUSTOMER)$", message = "Role must be USER, ADMIN or CUSTOMER")
    private String role;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
