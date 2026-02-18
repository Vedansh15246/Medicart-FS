package com.medicart.analytics.service;

import com.medicart.analytics.client.AuthClient;
import com.medicart.analytics.client.CartOrdersClient;
import com.medicart.analytics.client.CatalogueClient;
import com.medicart.analytics.dto.response.ReportDTO;
import com.medicart.analytics.entity.Report;
import com.medicart.analytics.repository.ReportRepository;
import com.medicart.common.dto.MedicineDTO;
import com.medicart.common.dto.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CartOrdersClient cartOrdersClient;

    @Autowired
    private CatalogueClient catalogueClient;

    @Autowired
    private AuthClient authClient;

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAllByOrderByGeneratedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReportDTO generateSalesReport(LocalDate startDate, LocalDate endDate) throws JsonProcessingException {
        LocalDate safeStart = startDate != null ? startDate : LocalDate.now().minusMonths(1);
        LocalDate safeEnd = endDate != null ? endDate : LocalDate.now();
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
        return convertToDTO(report);
    }

    public ReportDTO generateInventoryReport() throws JsonProcessingException {
        List<MedicineDTO> medicines = catalogueClient.getAllMedicines();
        if (medicines == null) {
            medicines = List.of();
        }

        int totalProducts = medicines.size();
        int lowStockCount = 0;
        int outOfStockCount = 0;
        double totalInventoryValue = 0.0;
        List<Map<String, Object>> lowStockItems = new ArrayList<>();

        for (MedicineDTO medicine : medicines) {
            if (medicine == null) {
                continue;
            }
            Integer qty = medicine.getTotalQuantity() != null ? medicine.getTotalQuantity() : 0;
            Double price = medicine.getPrice() != null ? medicine.getPrice() : 0.0;
            totalInventoryValue += price * qty;

            String status = medicine.getStockStatus();
            if (status == null || status.isBlank()) {
                if (qty <= 0) {
                    status = "OUT_OF_STOCK";
                } else if (qty <= 10) {
                    status = "LOW_STOCK";
                } else {
                    status = "IN_STOCK";
                }
            }

            if ("OUT_OF_STOCK".equalsIgnoreCase(status) || qty <= 0) {
                outOfStockCount++;
            } else if ("LOW_STOCK".equalsIgnoreCase(status) || qty <= 10) {
                lowStockCount++;
            }

            if ("OUT_OF_STOCK".equalsIgnoreCase(status) || "LOW_STOCK".equalsIgnoreCase(status)) {
                Map<String, Object> item = new HashMap<>();
                item.put("medicineId", medicine.getId());
                item.put("medicineName", medicine.getName());
                item.put("totalQuantity", qty);
                item.put("stockStatus", status);
                lowStockItems.add(item);
            }
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("totalProducts", totalProducts);
        reportData.put("lowStockCount", lowStockCount);
        reportData.put("outOfStockCount", outOfStockCount);
        reportData.put("totalInventoryValue", totalInventoryValue);
        reportData.put("lowStockItems", lowStockItems);

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
        return convertToDTO(report);
    }

    public ReportDTO generateUserActivityReport(LocalDate startDate, LocalDate endDate) throws JsonProcessingException {
        LocalDate safeStart = startDate != null ? startDate : LocalDate.now().minusMonths(1);
        LocalDate safeEnd = endDate != null ? endDate : LocalDate.now();

        List<UserDTO> users = authClient.getAllUsers();
        if (users == null) {
            users = List.of();
        }

        List<Map<String, Object>> registrations = users.stream()
                .filter(user -> user != null)
                .map(user -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("userId", user.getId());
                    row.put("username", user.getFullName() != null && !user.getFullName().isBlank()
                            ? user.getFullName()
                            : user.getEmail());
                    row.put("registeredAt", user.getCreatedAt());
                    row.put("email", user.getEmail());
                    return row;
                })
                .toList();

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("startDate", safeStart.toString());
        reportData.put("endDate", safeEnd.toString());
        reportData.put("totalCustomers", users.size());
        reportData.put("registrations", registrations);

        String jsonData = objectMapper.writeValueAsString(reportData);

        Report report = Report.builder()
                .reportType("USER_ACTIVITY")
                .reportName("User Activity Report: " + safeStart + " to " + safeEnd)
                .startDate(safeStart)
                .endDate(safeEnd)
                .reportData(jsonData)
                .generatedAt(LocalDateTime.now())
                .build();

        report = reportRepository.save(report);
        return convertToDTO(report);
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


