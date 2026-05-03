package com.sprint.payment_service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
@EnableDiscoveryClient
public class PaymentServiceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        loadLocalEnv();
        SpringApplication.run(PaymentServiceApplication.class, args);
    }

    private static void loadLocalEnv() {
        Path envPath = findLocalEnvPath();
        if (envPath == null) {
            return;
        }

        try {
            for (String line : Files.readAllLines(envPath)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }

                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }

                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException ignored) {
            // Local .env loading is optional; production should use real environment variables.
        }
    }

    private static Path findLocalEnvPath() {
        Path[] candidates = {
                Path.of(".env"),
                Path.of("..", ".env").normalize()
        };

        for (Path candidate : candidates) {
            if (Files.exists(candidate)) {
                return candidate;
            }
        }
        return null;
    }
}
