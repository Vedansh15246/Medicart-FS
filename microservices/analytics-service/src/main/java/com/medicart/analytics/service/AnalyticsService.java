package com.medicart.analytics.service;

import com.medicart.analytics.client.AuthClient;
import com.medicart.analytics.client.CartOrdersClient;
import com.medicart.analytics.client.CatalogueClient;
import com.medicart.analytics.dto.response.AnalyticsSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private AuthClient authClient;
    
    @Autowired
    private CartOrdersClient cartOrdersClient;
    
    @Autowired
    private CatalogueClient catalogueClient;

    /**
     * Fetches real-time analytics from all services via Feign clients
     */
    public AnalyticsSummaryDTO getSummary() {
        Map<String, Long> userCounts = authClient.getUserCounts();

        Map<String, Long> orderCounts = cartOrdersClient.getOrderCounts();
        if (orderCounts == null) {
            orderCounts = Collections.emptyMap();
        }

        Map<String, Double> revenue = cartOrdersClient.getRevenue();
        if (revenue == null) {
            revenue = Collections.emptyMap();
        }

        return AnalyticsSummaryDTO.builder()
                .totalUsers(userCounts.getOrDefault("totalUsers", 0L))
                .usersToday(userCounts.getOrDefault("usersToday", 0L))
                .usersThisWeek(userCounts.getOrDefault("usersThisWeek", 0L))
                .usersThisMonth(userCounts.getOrDefault("usersThisMonth", 0L))
                .usersThisYear(userCounts.getOrDefault("usersThisYear", 0L))
                .totalRevenue(revenue.getOrDefault("totalRevenue", 0.0))
                .revenueToday(revenue.getOrDefault("revenueToday", 0.0))
                .revenueThisWeek(revenue.getOrDefault("revenueThisWeek", 0.0))
                .revenueThisMonth(revenue.getOrDefault("revenueThisMonth", 0.0))
                .revenueThisYear(revenue.getOrDefault("revenueThisYear", 0.0))
                .totalOrders(orderCounts.getOrDefault("totalOrders", 0L))
                .ordersToday(orderCounts.getOrDefault("ordersToday", 0L))
                .ordersThisWeek(orderCounts.getOrDefault("ordersThisWeek", 0L))
                .ordersThisMonth(orderCounts.getOrDefault("ordersThisMonth", 0L))
                .ordersThisYear(orderCounts.getOrDefault("ordersThisYear", 0L))
                .avgOrderValue(revenue.getOrDefault("avgOrderValue", 0.0))
                .computedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Fetches top-selling products from cart-orders-service
     */
    public List<Map<String, Object>> getTopProducts() {
        return cartOrdersClient.getTopProducts();
    }

    /**
     * Fetches sales by category from admin-catalogue-service
     */
    public List<Map<String, Object>> getSalesByCategory() {
        List<Map<String, Object>> categorySales = cartOrdersClient.getSalesByCategory();
        if (categorySales != null && !categorySales.isEmpty()) {
            return categorySales;
        }
        return catalogueClient.getSalesByCategory();
    }

    /**
     * Fetches order status distribution from cart-orders-service
     */
    // Removed getOrderStatusDistribution(): endpoint was unused by the frontend and the wrapper
    // The cart-orders-service still provides the aggregation at /api/analytics/order-status-distribution

    public List<Map<String, Object>> getOrderSeries(String range) {
        return cartOrdersClient.getOrderSeries(range);
    }

    public List<Map<String, Object>> getRevenueSeries(String range) {
        return cartOrdersClient.getRevenueSeries(range);
    }
}
