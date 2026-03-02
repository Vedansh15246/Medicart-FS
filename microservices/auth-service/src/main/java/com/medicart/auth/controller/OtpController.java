/*
 * ========================================
 * OTP CONTROLLER - OTP VERIFICATION APIs
 * ========================================
 * This controller handles OTP (One-Time Password) operations for email verification.
 * 
 * BASE URL: /auth/otp
 * 
 * WHAT THIS CONTROLLER DOES:
 * ✅ Send OTP to email (for verification)
 * ✅ Verify OTP and complete registration
 * 
 * USE CASES:
 * - Email verification during registration
 * - Two-factor authentication
 * - Secure login flow
 */

package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import com.medicart.auth.service.OtpService;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuthService authService;

    /*
     * SEND OTP TO EMAIL
     * Endpoint: POST /auth/otp/send
     * Access: Public
     * 
     * Generates 6-digit OTP and sends to user's email
     * 
     * Request: {"email": "user@example.com"}
     * Response: {"message": "OTP sent", "demoOtp": "123456", "expiryMinutes": 10}
     * 
     * NOTE: In demo mode, OTP is returned in response and logged to console
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Email is required")
                );
            }

            Map<String, Object> response = otpService.generateAndSendOtp(email);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to send OTP: " + e.getMessage())
            );
        }
    }

    /*
     * VERIFY OTP AND COMPLETE REGISTRATION
     * Endpoint: POST /auth/otp/verify
     * Access: Public
     * 
     * Verifies OTP code and completes user registration if additional data provided
     * 
     * FOR REGISTRATION:
     * Request: {
     *   "email": "user@example.com",
     *   "otp": "123456",
     *   "fullName": "John Doe",
     *   "phone": "1234567890",
     *   "password": "pass123"
     * }
     * Response: LoginResponse with JWT token
     * 
     * FOR SIMPLE VERIFICATION:
     * Request: {"email": "user@example.com", "otp": "123456"}
     * Response: {"message": "Email verified successfully", "status": "verified"}
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String otp = (String) request.get("otp");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Email is required")
                );
            }

            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "OTP is required")
                );
            }


            // Verify OTP
            if (!otpService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid or expired OTP")
                );
            }


            // Check if this is registration or simple verification
            String fullName = (String) request.get("fullName");
            String phone = (String) request.get("phone");
            String password = (String) request.get("password");

            if (fullName != null && phone != null && password != null) {
                // Registration flow - create user account
                
                RegisterRequest registerRequest = RegisterRequest.builder()
                        .email(email)
                        .fullName(fullName)
                        .phone(phone)
                        .password(password)
                        .build();

                LoginResponse response = authService.register(registerRequest);
                return ResponseEntity.ok(response);
            } else {
                // Simple verification - just confirm OTP is valid
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Email verified successfully");
                response.put("email", email);
                response.put("status", "verified");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
