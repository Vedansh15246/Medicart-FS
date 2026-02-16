package com.medicart.analytics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long id;
    private String reportType;
    private String reportName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reportData;
    private LocalDateTime generatedAt;
}
