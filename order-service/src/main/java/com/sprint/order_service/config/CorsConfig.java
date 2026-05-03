package com.sprint.order_service.config;

// CORS is handled exclusively by the API Gateway (CorsWebFilter in api-gateway).
// Removed WebMvcConfigurer CORS mappings to prevent duplicate 'Access-Control-Allow-Origin' headers.

import org.springframework.context.annotation.Configuration;

@Configuration
public class CorsConfig {
    // No CORS mappings — gateway handles it
}
