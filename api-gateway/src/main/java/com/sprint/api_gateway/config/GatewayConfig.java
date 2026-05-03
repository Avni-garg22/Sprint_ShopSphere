package com.sprint.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

            // Auth Service — controller base: /auth
            .route("auth-docs", r -> r.path("/gateway/auth/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/auth/v3/api-docs", "/v3/api-docs"))
                .uri("lb://auth-service"))
            .route("auth", r -> r.path("/gateway/auth/**")
                .filters(f -> f.rewritePath("/gateway/auth/(?<segment>.*)", "/auth/${segment}"))
                .uri("lb://auth-service"))

            // Catalog Service — controller base: /products
            .route("catalog-docs", r -> r.path("/gateway/catalog/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/catalog/v3/api-docs", "/v3/api-docs"))
                .uri("lb://catalog-service"))
            .route("catalog-featured-compat", r -> r.path("/gateway/catalog/featured")
                .filters(f -> f.rewritePath("/gateway/catalog/featured", "/products/featured"))
                .uri("lb://catalog-service"))
            .route("catalog", r -> r.path("/gateway/catalog/**")
                .filters(f -> f.rewritePath("/gateway/catalog/(?<segment>.*)", "/${segment}"))
                .uri("lb://catalog-service"))

            // Payment Service — controller base: /api/payment
            .route("payment-docs", r -> r.path("/gateway/payment/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/payment/v3/api-docs", "/v3/api-docs"))
                .uri("lb://payment-service"))
            .route("payment", r -> r.path("/gateway/payment/**")
                .filters(f -> f.rewritePath("/gateway/payment/(?<segment>.*)", "/${segment}"))
                .uri("lb://payment-service"))

            // Order Service — controller base: /orders
            .route("orders-docs", r -> r.path("/gateway/orders/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/orders/v3/api-docs", "/v3/api-docs"))
                .uri("lb://order-service"))
            .route("orders-payment-compat", r -> r.path("/gateway/orders/payment")
                .filters(f -> f.rewritePath("/gateway/orders/payment", "/api/payment"))
                .uri("lb://payment-service"))
            .route("orders", r -> r.path("/gateway/orders/**")
                .filters(f -> f.rewritePath("/gateway/orders/(?<segment>.*)", "/orders/${segment}"))
                .uri("lb://order-service"))

            // Admin Service — controller base: /admin
            .route("admin-docs", r -> r.path("/gateway/admin/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/admin/v3/api-docs", "/v3/api-docs"))
                .uri("lb://admin-service"))
            .route("admin", r -> r.path("/gateway/admin/**")
                .filters(f -> f.rewritePath("/gateway/admin/(?<segment>.*)", "/admin/${segment}"))
                .uri("lb://admin-service"))

            // Notification Service — controller base: /notify
            .route("notification-docs", r -> r.path("/gateway/notify/v3/api-docs")
                .filters(f -> f.rewritePath("/gateway/notify/v3/api-docs", "/v3/api-docs"))
                .uri("lb://notification-service"))
            .route("notification", r -> r.path("/gateway/notify", "/gateway/notify/**")
                .filters(f -> f.rewritePath("/gateway/notify(?<segment>/.*|$)", "/notify${segment}"))
                .uri("lb://notification-service"))

            .build();
    }
}
