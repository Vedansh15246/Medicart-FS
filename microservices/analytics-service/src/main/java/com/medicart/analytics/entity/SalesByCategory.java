package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_by_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesByCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "category_name")
    private String categoryName;
    @Column(name = "total_revenue")
    private Double totalRevenue;
    @Column(name = "total_quantity")
    private Long totalQuantity;
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
