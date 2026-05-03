package com.sprint.api_gateway.filter;

import java.security.Key;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class AuthFilter implements GlobalFilter, Ordered {

    private final String SECRET = "sprint-secret-key-shared-across-all-microservices-2024";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path   = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        // Always allow OPTIONS (CORS preflight) — must pass through to CorsWebFilter
        if (method.equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        // Public paths — no token needed
        if (path.startsWith("/gateway/auth")
                || path.startsWith("/auth")
                || path.contains("/v3/api-docs")
                || path.contains("/swagger-ui")
                || path.contains("/webjars")
                || ((path.startsWith("/gateway/catalog") || path.startsWith("/products"))
                        && method.equals("GET"))) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String role = normalizeRole(claims.get("role"));

            if ((path.startsWith("/gateway/admin") || path.startsWith("/admin")) && !"ADMIN".equals(role)) {
                return reject(exchange, HttpStatus.FORBIDDEN);
            }

        } catch (Exception e) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        return chain.filter(exchange);
    }

    /**
     * Reject a request with the given status.
     * CorsWebFilter (order = HIGHEST_PRECEDENCE) already added CORS headers on the way in,
     * so we must NOT add them again here — that causes the duplicate header browser error.
     */
    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    private String normalizeRole(Object role) {
        if (role == null) {
            return "";
        }
        return role.toString().replaceFirst("^ROLE_", "").trim().toUpperCase();
    }

    @Override
    public int getOrder() {
        // Must be AFTER CorsWebFilter (which runs at Ordered.HIGHEST_PRECEDENCE = -2147483648)
        // Positive value ensures CORS headers are always added before auth checks
        return 1;
    }
}
