package com.sprint.admin_service.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.sprint.admin_service.dto.ProductDto;

@FeignClient(name = "catalog-service")
public interface CatalogClient {

    @GetMapping("/products")
    List<ProductDto> getAllProducts();
}