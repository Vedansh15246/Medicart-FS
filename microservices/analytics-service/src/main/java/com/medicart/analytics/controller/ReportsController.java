package com.medicart.analytics.controller;

import com.medicart.analytics.dto.response.ReportDTO;
import com.medicart.analytics.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportsController {
    private static final Logger log = LoggerFactory.getLogger(ReportsController.class);

    @Autowired
    private ReportService reportService;

    @GetMapping("/list")
    public ResponseEntity<?> getAllReports() {
        try {
            log.info("📊 GET /api/admin/reports/list");
            List<ReportDTO> reports = reportService.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("❌ Error fetching reports: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to fetch reports",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/sales")
    public ResponseEntity<?> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) startDate = LocalDate.now().minusMonths(1);
            if (endDate == null) endDate = LocalDate.now();
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid date range",
                        "message", "startDate must be before or equal to endDate."
                ));
            }
            
            log.info("📊 GET /api/admin/reports/sales?startDate={}&endDate={}", startDate, endDate);
            ReportDTO report = reportService.generateSalesReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("❌ Error generating sales report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to generate sales report",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventoryReport() {
        try {
            log.info("📊 GET /api/admin/reports/inventory");
            ReportDTO report = reportService.generateInventoryReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("❌ Error generating inventory report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to generate inventory report",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            ));
        }
    }

    @GetMapping("/user-activity")
    public ResponseEntity<?> getUserActivityReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) startDate = LocalDate.now().minusMonths(1);
            if (endDate == null) endDate = LocalDate.now();
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid date range",
                        "message", "startDate must be before or equal to endDate."
                ));
            }
            
            log.info("📊 GET /api/admin/reports/user-activity?startDate={}&endDate={}", startDate, endDate);
            ReportDTO report = reportService.generateUserActivityReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("❌ Error generating user activity report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to generate user activity report",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        try {
            log.info("🗑️ DELETE /api/admin/reports/{}", reportId);
            boolean deleted = reportService.deleteReport(reportId);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("deleted", true, "reportId", reportId));
        } catch (Exception e) {
            log.error("❌ Error deleting report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to delete report",
                    "message", e.getMessage() == null ? "Unexpected error" : e.getMessage()
            ));
        }
    }
}



