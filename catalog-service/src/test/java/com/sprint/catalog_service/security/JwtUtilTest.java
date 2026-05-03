package com.sprint.catalog_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    @InjectMocks
    private JwtUtil jwtUtil;

    private final String SECRET = "sprint-secret-key-shared-across-all-microservices-2024";

    private String generateToken(String username, String role) {
        Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        String token = generateToken("testuser", "USER");
        assertEquals("testuser", jwtUtil.extractUsername(token));
    }

    @Test
    void extractRole_ShouldReturnCorrectRole() {
        String token = generateToken("testuser", "ADMIN");
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void extractClaims_ShouldReturnClaims() {
        String token = generateToken("testuser", "USER");
        assertNotNull(jwtUtil.extractClaims(token));
        assertEquals("testuser", jwtUtil.extractClaims(token).getSubject());
    }

    @Test
    void extractUsername_ShouldThrowException_ForInvalidToken() {
        assertThrows(Exception.class, () -> jwtUtil.extractUsername("invalid.token.here"));
    }

    @Test
    void extractRole_ShouldReturnUserRole() {
        String token = generateToken("user1", "USER");
        assertEquals("USER", jwtUtil.extractRole(token));
    }
}
