package com.sprint.auth_service.exception;

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
    void handleRuntime_ShouldReturn400() {
        RuntimeException ex = new RuntimeException("User not found");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntime(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("User not found", response.getBody().get("message"));
    }

    @Test
    void handleRuntime_ShouldIncludeTimestamp() {
        ResponseEntity<Map<String, Object>> response = handler.handleRuntime(new RuntimeException("err"));
        assertNotNull(response.getBody().get("timestamp"));
    }
}
