package com.medicart.admin.controller;

import com.medicart.admin.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/sales-by-category")
    public ResponseEntity<List<Map<String, Object>>> getSalesByCategory() {
        try {
            log.info("GET /api/analytics/sales-by-category");
            return ResponseEntity.ok(analyticsService.getSalesByCategory());
        } catch (Exception e) {
            log.error("Failed to compute sales by category: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
