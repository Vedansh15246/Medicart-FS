package com.medicart.analytics.controller;

import com.medicart.analytics.dto.response.AnalyticsSummaryDTO;
import com.medicart.analytics.service.AnalyticsService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    private static final Set<String> SUPPORTED_RANGES = Set.of("daily", "weekly", "monthly", "yearly");

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        try {
            log.info("GET /api/admin/analytics/summary");
            AnalyticsSummaryDTO summary = analyticsService.getSummary();
            if (summary == null) {
                log.warn("Analytics summary is null. Returning empty summary.");
                return ResponseEntity.ok(AnalyticsSummaryDTO.builder().build());
            }
            return ResponseEntity.ok(summary);
        } catch (FeignException e) {
            log.error("Feign error fetching analytics summary: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (Exception e) {
            log.error("Error fetching analytics summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        try {
            log.info("GET /api/admin/analytics/top-products");
            List<Map<String, Object>> topProducts = analyticsService.getTopProducts();
            return ResponseEntity.ok(topProducts != null ? topProducts : Collections.emptyList());
        } catch (FeignException e) {
            log.error("Feign error fetching top products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (Exception e) {
            log.error("Error fetching top products: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/sales-by-category")
    public ResponseEntity<List<Map<String, Object>>> getSalesByCategory() {
        try {
            log.info("GET /api/admin/analytics/sales-by-category");
            List<Map<String, Object>> salesByCategory = analyticsService.getSalesByCategory();
            return ResponseEntity.ok(salesByCategory != null ? salesByCategory : Collections.emptyList());
        } catch (FeignException e) {
            log.error("Feign error fetching sales by category: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (Exception e) {
            log.error("Error fetching sales by category: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // order-status-distribution endpoint removed — not used by frontend. See analytics/cart-orders services for distribution logic.


    @GetMapping("/order-series")
    public ResponseEntity<List<Map<String, Object>>> getOrderSeries(
            @RequestParam(defaultValue = "weekly") String range) {
        try {
            log.info("GET /api/admin/analytics/order-series?range={}", range);
            if (!SUPPORTED_RANGES.contains(range.toLowerCase())) {
                return ResponseEntity.badRequest().body(List.of(Map.of(
                        "error", "Unsupported range",
                        "message", "Use one of: daily, weekly, monthly, yearly."
                )));
            }
            return ResponseEntity.ok(analyticsService.getOrderSeries(range));
        } catch (FeignException e) {
            log.error("Feign error fetching order series: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(List.of(Map.of(
                    "error", "Failed to fetch order series from cart-orders-service",
                    "message", e.getMessage() == null ? "Upstream error" : e.getMessage()
            )));
        } catch (Exception e) {
            log.error("Error fetching order series: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(List.of(Map.of(
                    "error", "Failed to fetch order series",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            )));
        }
    }

    @GetMapping("/revenue-series")
    public ResponseEntity<List<Map<String, Object>>> getRevenueSeries(
            @RequestParam(defaultValue = "weekly") String range) {
        try {
            log.info("GET /api/admin/analytics/revenue-series?range={}", range);
            if (!SUPPORTED_RANGES.contains(range.toLowerCase())) {
                return ResponseEntity.badRequest().body(List.of(Map.of(
                        "error", "Unsupported range",
                        "message", "Use one of: daily, weekly, monthly, yearly."
                )));
            }
            return ResponseEntity.ok(analyticsService.getRevenueSeries(range));
        } catch (FeignException e) {
            log.error("Feign error fetching revenue series: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(List.of(Map.of(
                    "error", "Failed to fetch revenue series from cart-orders-service",
                    "message", e.getMessage() == null ? "Upstream error" : e.getMessage()
            )));
        } catch (Exception e) {
            log.error("Error fetching revenue series: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(List.of(Map.of(
                    "error", "Failed to fetch revenue series",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            )));
        }
    }
}

