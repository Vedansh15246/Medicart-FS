package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDTO {

    private Long id;
    private String batchNo;
    private LocalDate expiryDate;
    private Integer qtyAvailable;

    // 🔑 required for backend logic
    private Long medicineId;

    // 🔑 required for frontend display
    private String medicineName;
}
