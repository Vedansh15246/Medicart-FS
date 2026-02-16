package com.medicart.analytics.service;

import com.medicart.analytics.client.AuthClient;
import com.medicart.analytics.client.CartOrdersClient;
import com.medicart.analytics.client.CatalogueClient;
import com.medicart.analytics.dto.response.AnalyticsSummaryDTO;
import com.medicart.common.dto.MedicineDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
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
        log.info("📊 Fetching real-time analytics summary from all services...");
        
        try {
            // Fetch user counts from auth-service
            log.info("Calling auth-service for user counts...");
            Map<String, Long> userCounts = authClient.getUserCounts();
            
            // Fetch order counts from cart-orders-service
            log.info("Calling cart-orders-service for order counts...");
            Map<String, Long> orderCounts = cartOrdersClient.getOrderCounts();
            if (orderCounts == null) {
                log.warn("cart-orders-service returned null for order counts — treating as empty map");
                orderCounts = Collections.emptyMap();
            }

            // Fetch revenue from cart-orders-service
            log.info("Calling cart-orders-service for revenue...");
            Map<String, Double> revenue = cartOrdersClient.getRevenue();
            if (revenue == null) {
                log.warn("cart-orders-service returned null for revenue — treating as empty map");
                revenue = Collections.emptyMap();
            }

            AnalyticsSummaryDTO summary = AnalyticsSummaryDTO.builder()
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
            
            log.info("✅ Analytics summary computed successfully");
            log.info("   Users: {}, Orders: {}, Revenue: {}", 
                summary.getTotalUsers(), summary.getTotalOrders(), summary.getTotalRevenue());
            
            return summary;
            
        } catch (Exception e) {
            log.error("❌ Error fetching analytics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch analytics data from services", e);
        }
    }

    /**
     * Fetches top-selling products from cart-orders-service
     */
    public List<Map<String, Object>> getTopProducts() {
        log.info("📊 Fetching top products from cart-orders-service...");
        try {
            List<Map<String, Object>> topProducts = cartOrdersClient.getTopProducts();
            log.info("✅ Top products fetched: {} items", topProducts.size());
            return topProducts;
        } catch (Exception e) {
            log.error("❌ Error fetching top products: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch top products", e);
        }
    }

    /**
     * Fetches sales by category from admin-catalogue-service
     */
    public List<Map<String, Object>> getSalesByCategory() {
        log.info("📊 Fetching sales by category from cart-orders-service...");
        try {
            List<Map<String, Object>> categorySales = cartOrdersClient.getSalesByCategory();
            if (categorySales != null && !categorySales.isEmpty()) {
                log.info("✅ Category sales fetched from cart-orders-service: {} categories", categorySales.size());
                return categorySales;
            }
            log.warn("cart-orders-service returned empty sales-by-category. Falling back to admin-catalogue-service.");
        } catch (Exception e) {
            log.warn("cart-orders-service sales-by-category failed ({}). Falling back to admin-catalogue-service.", e.getMessage());
        }

        try {
            List<Map<String, Object>> categorySales = catalogueClient.getSalesByCategory();
            log.info("✅ Category sales fetched from admin-catalogue-service: {} categories", categorySales.size());
            return categorySales;
        } catch (Exception e) {
            log.error("❌ Error fetching category sales from fallback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch category sales", e);
        }
    }

    /**
     * Fetches order status distribution from cart-orders-service
     */
    public Map<String, Long> getOrderStatusDistribution() {
        log.info("📊 Fetching order status distribution from cart-orders-service...");
        try {
            Map<String, Long> distribution = cartOrdersClient.getOrderStatusDistribution();
            log.info("✅ Order status distribution fetched: {} statuses", distribution.size());
            return distribution;
        } catch (Exception e) {
            log.error("❌ Error fetching order status distribution: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch order status distribution", e);
        }
    }

    public List<Map<String, Object>> getOrderSeries(String range) {
        log.info("📊 Fetching order series for range {}", range);
        try {
            return cartOrdersClient.getOrderSeries(range);
        } catch (Exception e) {
            log.error("❌ Error fetching order series: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch order series", e);
        }
    }

    public List<Map<String, Object>> getRevenueSeries(String range) {
        log.info("📊 Fetching revenue series for range {}", range);
        try {
            return cartOrdersClient.getRevenueSeries(range);
        } catch (Exception e) {
            log.error("❌ Error fetching revenue series: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch revenue series", e);
        }
    }
}
