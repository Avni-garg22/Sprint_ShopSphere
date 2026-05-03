package com.sprint.auth_service.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void user_ShouldSetAndGetAllFields() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("encodedPass");
        user.setRole("USER");
        user.setEmail("test@gmail.com");

        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("encodedPass", user.getPassword());
        assertEquals("USER", user.getRole());
        assertEquals("test@gmail.com", user.getEmail());
    }

    @Test
    void user_ShouldSupportParameterizedConstructor() {
        User user = new User(1L, "admin", "pass", "ADMIN", "admin@admin.com");
        assertEquals("admin", user.getUsername());
        assertEquals("ADMIN", user.getRole());
    }

    @Test
    void user_DefaultConstructor_ShouldCreateEmptyUser() {
        User user = new User();
        assertNotNull(user);
        assertNull(user.getId());
        assertNull(user.getUsername());
    }
}
