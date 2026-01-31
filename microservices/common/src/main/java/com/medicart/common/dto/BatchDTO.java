package com.medicart.common.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDTO {
    private Long id;
    private String batchNo;
    private LocalDate expiryDate;
    private Integer qtyAvailable;
    private Long medicineId;
    private String medicineName;
}
