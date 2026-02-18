package com.medicart.cartorders.controller;

import com.medicart.cartorders.service.OrderAnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/analytics")
@Slf4j
public class AnalyticsController {

    private static final Set<String> SUPPORTED_RANGES = Set.of("daily", "weekly", "monthly", "yearly");

    private final OrderAnalyticsService analyticsService;

    public AnalyticsController(OrderAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/order-counts")
    public ResponseEntity<Map<String, Long>> getOrderCounts() {
        try {
            log.info("GET /api/analytics/order-counts");
            return ResponseEntity.ok(analyticsService.getOrderCounts());
        } catch (Exception e) {
            log.error("Failed to compute order counts: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Double>> getRevenue() {
        try {
            log.info("GET /api/analytics/revenue");
            return ResponseEntity.ok(analyticsService.getRevenueSummary());
        } catch (Exception e) {
            log.error("Failed to compute revenue: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/order-status-distribution")
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        try {
            log.info("GET /api/analytics/order-status-distribution");
            return ResponseEntity.ok(analyticsService.getOrderStatusDistribution());
        } catch (Exception e) {
            log.error("Failed to compute status distribution: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @RequestParam(defaultValue = "6") int limit) {
        try {
            log.info("GET /api/analytics/top-products?limit={}", limit);
            return ResponseEntity.ok(analyticsService.getTopProducts(limit));
        } catch (Exception e) {
            log.error("Failed to compute top products: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
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

    @GetMapping("/order-series")
    public ResponseEntity<List<Map<String, Object>>> getOrderSeries(
            @RequestParam(defaultValue = "weekly") String range) {
        try {
            log.info("GET /api/analytics/order-series?range={}", range);
            if (!SUPPORTED_RANGES.contains(range.toLowerCase())) {
                return ResponseEntity.badRequest().body(List.of(Map.of(
                        "error", "Unsupported range",
                        "message", "Use one of: daily, weekly, monthly, yearly."
                )));
            }
            return ResponseEntity.ok(analyticsService.getOrderSeries(range));
        } catch (Exception e) {
            log.error("Failed to compute order series: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(List.of(Map.of(
                    "error", "Failed to compute order series",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            )));
        }
    }

    @GetMapping("/revenue-series")
    public ResponseEntity<List<Map<String, Object>>> getRevenueSeries(
            @RequestParam(defaultValue = "weekly") String range) {
        try {
            log.info("GET /api/analytics/revenue-series?range={}", range);
            if (!SUPPORTED_RANGES.contains(range.toLowerCase())) {
                return ResponseEntity.badRequest().body(List.of(Map.of(
                        "error", "Unsupported range",
                        "message", "Use one of: daily, weekly, monthly, yearly."
                )));
            }
            return ResponseEntity.ok(analyticsService.getRevenueSeries(range));
        } catch (Exception e) {
            log.error("Failed to compute revenue series: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(List.of(Map.of(
                    "error", "Failed to compute revenue series",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            )));
        }
    }

    @GetMapping("/sales-report")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
            LocalDate end = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;
            if (start != null && end != null && start.isAfter(end)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid date range",
                        "message", "startDate must be before or equal to endDate."
                ));
            }
            log.info("GET /api/analytics/sales-report?startDate={}&endDate={}", startDate, endDate);
            return ResponseEntity.ok(analyticsService.getSalesReport(start, end));
        } catch (Exception e) {
            log.error("Failed to generate sales report: {}", e.getMessage(), e);
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("error", "Failed to generate sales report");
            errorBody.put("message", e.getMessage() == null ? "Unexpected error" : e.getMessage());
            return ResponseEntity.internalServerError().body(errorBody);
        }
    }
    
}
