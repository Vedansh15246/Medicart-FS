package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_status_distribution")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusDistribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "status")
    private String status;
    @Column(name = "count")
    private Long count;
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
