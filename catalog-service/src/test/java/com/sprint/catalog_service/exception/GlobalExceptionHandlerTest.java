package com.sprint.catalog_service.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Test
    void handleRuntime_ShouldReturn400_WithMessage() {
        RuntimeException ex = new RuntimeException("Product not found");

        ResponseEntity<Map<String, Object>> response = handler.handleRuntime(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Product not found", response.getBody().get("message"));
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Bad Request", response.getBody().get("error"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void handleRuntime_ShouldIncludeTimestamp() {
        RuntimeException ex = new RuntimeException("error");

        ResponseEntity<Map<String, Object>> response = handler.handleRuntime(ex);

        assertNotNull(response.getBody().get("timestamp"));
        assertFalse(response.getBody().get("timestamp").toString().isEmpty());
    }
}
