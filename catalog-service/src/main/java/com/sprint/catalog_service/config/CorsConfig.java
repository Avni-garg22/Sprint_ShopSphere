package com.sprint.catalog_service.config;

// CORS is handled exclusively by the API Gateway (CorsWebFilter in api-gateway).
// This file is intentionally left as a no-op to avoid duplicate CORS headers.
// The 'Access-Control-Allow-Origin: *, *' error is caused by both the gateway
// and the service adding the header — removing it here fixes that.

import org.springframework.context.annotation.Configuration;

@Configuration
public class CorsConfig {
    // No CORS mappings — gateway handles it
}
