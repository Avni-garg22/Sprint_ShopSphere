package com.sprint.catalog_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path uploadDirectory;

    public ProductImageStorageService(
            @Value("${app.upload.product-images-dir:uploads/product-images}") String uploadDirectory) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Only JPG, PNG, WEBP, and GIF images are allowed");
        }

        String extension = getExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID() + extension;
        Path destination = uploadDirectory.resolve(filename).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid image filename");
        }

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/product-images/" + filename;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to save product image", e);
        }
    }

    private String getExtension(String originalFilename, String contentType) {
        String cleaned = StringUtils.cleanPath(originalFilename == null ? "" : originalFilename);
        int dotIndex = cleaned.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < cleaned.length() - 1) {
            String extension = cleaned.substring(dotIndex).toLowerCase(Locale.ROOT);
            if (extension.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                return extension;
            }
        }

        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    public Path getUploadDirectory() {
        return uploadDirectory;
    }
}
