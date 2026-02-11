package com.medicart.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.auth.service.AuthService;
import com.medicart.auth.service.OtpService;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        return ResponseEntity.ok("Token is valid");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running on port 8081");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
        try {
            Object userDTO = authService.getUserById(userId);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            log.error("Failed to get user profile - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.status(404).body(java.util.Map.of("error", "User not found"));
        }
    }

    // ===== FORGOT PASSWORD: check email exists, generate OTP =====
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            // Check if user exists
            if (!authService.findByEmail(email.trim()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No account found with this email"));
            }

            // Generate OTP using existing OTP service
            Map<String, Object> otpResponse = otpService.generateAndSendOtp(email.trim());
            return ResponseEntity.ok(otpResponse);
        } catch (Exception e) {
            log.error("Forgot password failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== VERIFY FORGOT-PASSWORD OTP =====
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            if (email == null || otp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
            }

            boolean valid = otpService.verifyOtp(email.trim(), otp.trim());
            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
            }

            return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "verified", true));
        } catch (Exception e) {
            log.error("OTP verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== RESET PASSWORD: update password in DB =====
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");

            if (email == null || newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and new password are required"));
            }

            authService.resetPassword(email.trim(), newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            log.error("Reset password failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

