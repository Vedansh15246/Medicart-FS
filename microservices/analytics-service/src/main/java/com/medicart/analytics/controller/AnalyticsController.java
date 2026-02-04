package com.medicart.analytics.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalOrders", 150);
        dashboard.put("totalRevenue", 15000.0);
        dashboard.put("totalCustomers", 75);
        dashboard.put("avgOrderValue", 100.0);
        dashboard.put("medicinesInStock", 250);
        dashboard.put("lowStockMedicines", 12);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam(required = false) String period) {
        Map<String, Object> report = new HashMap<>();
        report.put("period", period != null ? period : "monthly");
        report.put("totalSales", 15000.0);
        report.put("totalOrders", 150);
        report.put("avgOrderValue", 100.0);
        report.put("topMedicines", new String[]{"Aspirin", "Ibuprofen", "Paracetamol"});
        return ResponseEntity.ok(report);
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalMedicines", 250);
        report.put("lowStockMedicines", 12);
        report.put("outOfStockMedicines", 5);
        report.put("expiringBatches", 8);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Analytics Service is running on port 8085");
    }
}
