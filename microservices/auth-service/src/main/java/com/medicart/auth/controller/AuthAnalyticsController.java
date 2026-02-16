package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/analytics")
public class AuthAnalyticsController {
    private static final Logger log = LoggerFactory.getLogger(AuthAnalyticsController.class);

    private final AuthService authService;

    public AuthAnalyticsController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/user-counts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        try {
            log.info("GET /auth/analytics/user-counts");
            Map<String, Long> counts = authService.getUserCounts();
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            log.error("Failed to compute user counts: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
