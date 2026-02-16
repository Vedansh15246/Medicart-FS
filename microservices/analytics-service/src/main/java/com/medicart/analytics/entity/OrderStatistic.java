package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_statistics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatistic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "total_orders")
    private Long totalOrders;
    
    @Column(name = "orders_today")
    private Long ordersToday;
    
    @Column(name = "orders_this_week")
    private Long ordersThisWeek;
    
    @Column(name = "orders_this_month")
    private Long ordersThisMonth;
    
    @Column(name = "orders_this_year")
    private Long ordersThisYear;
    
    @Column(name = "avg_order_value")
    private Double avgOrderValue;
    
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
