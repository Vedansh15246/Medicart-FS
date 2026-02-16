package com.medicart.analytics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    // User metrics
    private Long totalUsers;
    private Long usersToday;
    private Long usersThisWeek;
    private Long usersThisMonth;
    private Long usersThisYear;
    
    // Revenue metrics
    private Double totalRevenue;
    private Double revenueToday;
    private Double revenueThisWeek;
    private Double revenueThisMonth;
    private Double revenueThisYear;
    
    // Order metrics
    private Long totalOrders;
    private Long ordersToday;
    private Long ordersThisWeek;
    private Long ordersThisMonth;
    private Long ordersThisYear;
    private Double avgOrderValue;
    
    private LocalDateTime computedAt;
}
