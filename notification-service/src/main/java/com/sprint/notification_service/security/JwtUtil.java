package com.sprint.notification_service.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret:sprint-secret-key-shared-across-all-microservices-2024}")
    private String secret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(String token) {
        Object id = extractClaims(token).get("id");
        return id == null ? null : Long.valueOf(id.toString());
    }

    public String extractRole(String token) {
        Object role = extractClaims(token).get("role");
        return role == null ? "" : role.toString().replaceFirst("^ROLE_", "").trim().toUpperCase();
    }
}
