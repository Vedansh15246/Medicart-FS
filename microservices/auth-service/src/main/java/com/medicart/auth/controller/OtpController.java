package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import com.medicart.auth.service.OtpService;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * OTP endpoints for email verification during registration and login
 */
@RestController
@RequestMapping("/auth/otp")
public class OtpController {
    private static final Logger log = LoggerFactory.getLogger(OtpController.class);

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuthService authService;

    /**
     * Send OTP to email (mocked - returns OTP in response for demo)
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

            log.info("Sending OTP to email: {}", email);
            Map<String, Object> response = otpService.generateAndSendOtp(email);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to send OTP", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to send OTP: " + e.getMessage())
            );
        }
    }

    /**
     * Verify OTP and complete registration/login
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

            log.info("Verifying OTP for email: {}", email);

            // Verify OTP
            if (!otpService.verifyOtp(email, otp)) {
                log.error("OTP verification failed for email: {}", email);
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid or expired OTP")
                );
            }

            log.info("OTP verified successfully for email: {}", email);

            // Check if this is registration or login
            String fullName = (String) request.get("fullName");
            String phone = (String) request.get("phone");
            String password = (String) request.get("password");

            if (fullName != null && phone != null && password != null) {
                // Registration flow
                log.info("Processing registration for email: {}", email);
                
                RegisterRequest registerRequest = RegisterRequest.builder()
                        .email(email)
                        .fullName(fullName)
                        .phone(phone)
                        .password(password)
                        .build();

                LoginResponse response = authService.register(registerRequest);
                return ResponseEntity.ok(response);
            } else {
                // Login flow (not implemented in this version)
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Email verified successfully");
                response.put("email", email);
                response.put("status", "verified");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            log.error("OTP verification error", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
