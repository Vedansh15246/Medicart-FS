package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {

    private Long id;
    private Long userId;
    private Long medicineId;

    // 🔥 These are now populated correctly
    private String medicineName;
    private Double price;
    private Integer quantity;
    private Boolean inStock;

    // 🔥 Frontend should use this
    private MedicineDTO medicine;
}
