package com.sprint.auth_service.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    @Test
    void validation_ShouldAllowPublicEmailDomains_ForCustomers() {
        assertTrue(validator.validate(validRequest("customer@gmail.com", "CUSTOMER")).isEmpty());
        assertTrue(validator.validate(validRequest("customer@yahoo.com", "CUSTOMER")).isEmpty());
        assertTrue(validator.validate(validRequest("customer@outlook.com", "CUSTOMER")).isEmpty());
        assertTrue(validator.validate(validRequest("customer@example.org", "CUSTOMER")).isEmpty());
    }

    @Test
    void validation_ShouldRejectInvalidEmailFormat() {
        assertFalse(validator.validate(validRequest("not-an-email", "CUSTOMER")).isEmpty());
        assertFalse(validator.validate(validRequest("customer@example", "CUSTOMER")).isEmpty());
    }

    private RegisterRequest validRequest(String email, String role) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("Test123");
        request.setEmail(email);
        request.setRole(role);
        return request;
    }
}
