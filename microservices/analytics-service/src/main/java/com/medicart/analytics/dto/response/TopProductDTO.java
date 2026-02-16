package com.medicart.analytics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDTO {
    private Long medicineId;
    private String medicineName;
    private Long totalQuantity;
    private Double totalRevenue;
    private Integer rankPosition;
}
