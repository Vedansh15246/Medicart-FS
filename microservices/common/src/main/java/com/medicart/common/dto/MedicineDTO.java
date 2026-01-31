package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private String sku;
    private Boolean requiresRx;
    private String description;
    private Boolean inStock;
    private String stockStatus;
    private Integer totalQuantity;
}
