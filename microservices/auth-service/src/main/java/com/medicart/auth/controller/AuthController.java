/*
 * ========================================
 * AUTH CONTROLLER - AUTHENTICATION APIs
 * ========================================
 * This is the MAIN controller for authentication operations.
 * 
 * BASE URL: /auth
 * 
 * WHAT THIS CONTROLLER DOES:
 * ✅ User Registration (create new account)
 * ✅ User Login (authenticate and get JWT token)
 * ✅ Token Validation (check if token is valid)
 * ✅ Health Check (verify service is running)
 * ✅ Get Current User (fetch logged-in user's profile)
 * ✅ Forgot Password Flow (3 steps: request OTP → verify OTP → reset password)
 */

package com.medicart.auth.controller;

import java.util.Map;

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

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    /*
     * REGISTER NEW USER
     * Endpoint: POST /auth/register
     * Access: Public
     * 
     * Creates a new user account and returns JWT token
     * 
     * Request: {"email": "user@example.com", "password": "pass123", "fullName": "John", "phone": "1234567890"}
     * Response: {"token": "jwt...", "userId": 1, "email": "user@example.com", "roles": ["ROLE_USER"]}
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /*
     * LOGIN USER
     * Endpoint: POST /auth/login
     * Access: Public
     * 
     * Authenticates user and returns JWT token
     * 
     * Request: {"email": "user@example.com", "password": "pass123"}
     * Response: {"token": "jwt...", "userId": 1, "email": "user@example.com"}
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest()
            .body(java.util.Map.of("error", e.getMessage()));
    }
    }

    /*
     * VALIDATE TOKEN
     * Endpoint: GET /auth/validate
     * Access: Public
     * 
     * Simple endpoint to check if service is validating tokens
     */
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        return ResponseEntity.ok("Token is valid");
    }

    /*
     * HEALTH CHECK
     * Endpoint: GET /auth/health
     * Access: Public
     * 
     * Checks if auth service is running
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running on port 8081");
    }

    /*
     * GET CURRENT USER
     * Endpoint: GET /auth/me
     * Access: Protected (requires JWT token)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
        try {
            Object userDTO = authService.getUserById(userId);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", "User not found"));
        }
    }

    /*
     * FORGOT PASSWORD - STEP 1: REQUEST OTP
     * Endpoint: POST /auth/forgot-password
     * Access: Public
     * Generates and sends OTP to user's email
     * 
     * Request: {"email": "user@example.com"}
     * Response: {"message": "OTP sent", "demoOtp": "123456"}
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            if (!authService.findByEmail(email.trim()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No account found with this email"));
            }

            Map<String, Object> otpResponse = otpService.generateAndSendOtp(email.trim());
            return ResponseEntity.ok(otpResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*
     * FORGOT PASSWORD - STEP 2: VERIFY OTP
     * Endpoint: POST /auth/forgot-password/verify-otp
     * Access: Public
     * 
     * Verifies the OTP code sent to user's email
     * 
     * Request: {"email": "user@example.com", "otp": "123456"}
     * Response: {"message": "OTP verified successfully", "verified": true}
     */
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*
     * FORGOT PASSWORD - STEP 3: RESET PASSWORD
     * Endpoint: POST /auth/reset-password
     * Access: Public
     * 
     * Updates user's password in database
     * 
     * Response: {"message": "Password changed successfully"}
     */
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
