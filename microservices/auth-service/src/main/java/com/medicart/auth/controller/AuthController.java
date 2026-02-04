package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("🔐 Registration attempt for email: {}", request.getEmail());
            LoginResponse response = authService.register(request);
            log.info("✅ Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Register failed for email {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.info("🔐 LOGIN ATTEMPT");
            log.info("📧 Email received: {}", request.getEmail());
            log.info("🔑 Password length: {}", request.getPassword() != null ? request.getPassword().length() : "NULL");
            
            LoginResponse response = authService.login(request);
            
            log.info("✅ LOGIN SUCCESSFUL for email: {}", request.getEmail());
            log.info("👤 User ID: {}", response.getUserId());
            log.info("🎭 Roles: {}", response.getRoles());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ LOGIN FAILED for email {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        log.info("✅ Token validation successful");
        return ResponseEntity.ok("Token is valid");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.info("🏥 Health check: Auth Service is running on port 8081");
        return ResponseEntity.ok("Auth Service is running on port 8081");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("👤 Fetching current user profile for userId: {}", userId);
            Object userDTO = authService.getUserById(userId);
            log.info("✅ User profile retrieved successfully for userId: {}", userId);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            log.error("❌ Failed to get current user (userId: {}): {}", userId, e.getMessage(), e);
            return ResponseEntity.status(404).body(java.util.Map.of("error", "User not found"));
        }
    }
}

