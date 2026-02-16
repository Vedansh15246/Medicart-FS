package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "top_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "medicine_id")
    private Long medicineId;
    @Column(name = "medicine_name")
    private String medicineName;
    @Column(name = "total_quantity")
    private Long totalQuantity;
    @Column(name = "total_revenue")
    private Double totalRevenue;
    @Column(name = "rank_position")
    private Integer rankPosition;
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
