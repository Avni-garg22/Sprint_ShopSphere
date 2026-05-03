package com.sprint.catalog_service.config;

import com.sprint.catalog_service.service.ProductImageStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final ProductImageStorageService imageStorageService;

    public StaticResourceConfig(ProductImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/product-images/**")
                .addResourceLocations(imageStorageService.getUploadDirectory().toUri().toString());
    }
}
