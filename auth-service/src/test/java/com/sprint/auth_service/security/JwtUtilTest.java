package com.sprint.auth_service.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    @InjectMocks
    private JwtUtil jwtUtil;

    @Test
    void generateToken_ShouldReturnNonNullToken() {
        String token = jwtUtil.generateToken(1L, "testuser", "test@gmail.com", "USER");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateToken_ShouldContainThreeParts() {
        String token = jwtUtil.generateToken(1L, "testuser", "test@gmail.com", "USER");
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        String token = jwtUtil.generateToken(1L, "testuser", "test@gmail.com", "USER");
        String username = jwtUtil.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername_ForAdmin() {
        String token = jwtUtil.generateToken(2L, "adminuser", "admin@admin.com", "ADMIN");
        String username = jwtUtil.extractUsername(token);
        assertEquals("adminuser", username);
    }

    @Test
    void generateToken_ShouldGenerateDifferentTokens_ForDifferentUsers() {
        String token1 = jwtUtil.generateToken(1L, "user1", "user1@yahoo.com", "USER");
        String token2 = jwtUtil.generateToken(2L, "user2", "user2@outlook.com", "USER");
        assertNotEquals(token1, token2);
    }

    @Test
    void extractUsername_ShouldThrowException_ForInvalidToken() {
        assertThrows(Exception.class, () -> jwtUtil.extractUsername("invalid.token.here"));
    }
}
