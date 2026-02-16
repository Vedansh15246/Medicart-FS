package com.medicart.analytics.service;

import com.medicart.analytics.client.CartOrdersClient;
import com.medicart.analytics.dto.response.ReportDTO;
import com.medicart.analytics.entity.Report;
import com.medicart.analytics.repository.ReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CartOrdersClient cartOrdersClient;

    public List<ReportDTO> getAllReports() {
        log.info("📊 Fetching all reports");
        return reportRepository.findAllByOrderByGeneratedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReportDTO generateSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDate safeStart = startDate != null ? startDate : LocalDate.now().minusMonths(1);
        LocalDate safeEnd = endDate != null ? endDate : LocalDate.now();
        log.info("📊 Generating sales report from {} to {}", safeStart, safeEnd);
        
        try {
            Map<String, Object> reportData = cartOrdersClient.getSalesReport(
                safeStart.toString(),
                safeEnd.toString()
            );
            if (reportData == null) {
                reportData = new HashMap<>();
            }
            
            String jsonData = objectMapper.writeValueAsString(reportData);
            
            Report report = Report.builder()
                    .reportType("SALES")
                    .reportName("Sales Report: " + safeStart + " to " + safeEnd)
                    .startDate(safeStart)
                    .endDate(safeEnd)
                    .reportData(jsonData)
                    .generatedAt(LocalDateTime.now())
                    .build();
            
            report = reportRepository.save(report);
            log.info("✅ Sales report generated successfully");
            return convertToDTO(report);
        } catch (Exception e) {
            log.error("❌ Error generating sales report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate sales report: " + e.getMessage());
        }
    }

    public ReportDTO generateInventoryReport() {
        log.info("📊 Generating inventory report");
        
        try {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("totalProducts", 320);
            reportData.put("inStockProducts", 285);
            reportData.put("lowStockProducts", 25);
            reportData.put("outOfStockProducts", 10);
            reportData.put("totalInventoryValue", 850000.0);
            
            String jsonData = objectMapper.writeValueAsString(reportData);
            
            Report report = Report.builder()
                    .reportType("INVENTORY")
                    .reportName("Inventory Report: " + LocalDate.now())
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now())
                    .reportData(jsonData)
                    .generatedAt(LocalDateTime.now())
                    .build();
            
            report = reportRepository.save(report);
            log.info("✅ Inventory report generated successfully");
            return convertToDTO(report);
        } catch (Exception e) {
            log.error("❌ Error generating inventory report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate inventory report: " + e.getMessage());
        }
    }

    public ReportDTO generateUserActivityReport(LocalDate startDate, LocalDate endDate) {
        log.info("📊 Generating user activity report from {} to {}", startDate, endDate);
        
        try {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("totalUsers", 1250);
            reportData.put("activeUsers", 890);
            reportData.put("newRegistrations", 120);
            reportData.put("averageOrdersPerUser", 3.2);
            reportData.put("topUserSegment", "Regular Customers");
            
            String jsonData = objectMapper.writeValueAsString(reportData);
            
            Report report = Report.builder()
                    .reportType("USER_ACTIVITY")
                    .reportName("User Activity Report: " + startDate + " to " + endDate)
                    .startDate(startDate)
                    .endDate(endDate)
                    .reportData(jsonData)
                    .generatedAt(LocalDateTime.now())
                    .build();
            
            report = reportRepository.save(report);
            log.info("✅ User activity report generated successfully");
            return convertToDTO(report);
        } catch (Exception e) {
            log.error("❌ Error generating user activity report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate user activity report: " + e.getMessage());
        }
    }

    public boolean deleteReport(Long reportId) {
        if (reportId == null) {
            return false;
        }
        if (!reportRepository.existsById(reportId)) {
            return false;
        }
        reportRepository.deleteById(reportId);
        return true;
    }

    private ReportDTO convertToDTO(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .reportType(report.getReportType())
                .reportName(report.getReportName())
                .startDate(report.getStartDate())
                .endDate(report.getEndDate())
                .reportData(report.getReportData())
                .generatedAt(report.getGeneratedAt())
                .build();
    }
}


