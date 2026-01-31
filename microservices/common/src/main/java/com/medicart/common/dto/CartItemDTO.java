package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long userId;
    private Long medicineId;
    private String medicineName;
    private Double price;
    private Integer quantity;
    private Boolean inStock;
}
