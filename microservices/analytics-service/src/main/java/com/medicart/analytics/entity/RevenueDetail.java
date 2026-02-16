package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "revenue_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "total_revenue")
    private Double totalRevenue;
    
    @Column(name = "revenue_today")
    private Double revenueToday;
    
    @Column(name = "revenue_this_week")
    private Double revenueThisWeek;
    
    @Column(name = "revenue_this_month")
    private Double revenueThisMonth;
    
    @Column(name = "revenue_this_year")
    private Double revenueThisYear;
    
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
