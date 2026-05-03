package com.sprint.auth_service.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final String SECRET = "sprint-secret-key-shared-across-all-microservices-2024";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(Long id, String username, String email, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("email", email)
                .claim("role", role) // 🔥 add role
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
