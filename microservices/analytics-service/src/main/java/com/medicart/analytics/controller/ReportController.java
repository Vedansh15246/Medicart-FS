package com.medicart.analytics.controller;

import com.medicart.common.dto.ReportDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        List<ReportDTO> reports = new ArrayList<>();
        reports.add(ReportDTO.builder()
                .id(1L)
                .type("SALES")
                .data("Sales report data")
                .generatedAt(LocalDateTime.now())
                .generatedBy("Admin")
                .build());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        ReportDTO report = ReportDTO.builder()
                .id(id)
                .type("SALES")
                .data("Sales report data")
                .generatedAt(LocalDateTime.now())
                .generatedBy("Admin")
                .build();
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate")
    public ResponseEntity<ReportDTO> generateReport(@RequestParam String type) {
        ReportDTO report = ReportDTO.builder()
                .id(1L)
                .type(type)
                .data("Generated report data for " + type)
                .generatedAt(LocalDateTime.now())
                .generatedBy("Admin")
                .build();
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
