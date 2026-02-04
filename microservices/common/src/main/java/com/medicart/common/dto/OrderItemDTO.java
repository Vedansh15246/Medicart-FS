package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private Double priceAtPurchase;
    private Double unitPrice;
    private Double subtotal;
    private Long batchId;
    private String batchNo;
}
