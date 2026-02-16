package com.medicart.analytics.client;

import com.medicart.common.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.Map;

@FeignClient(name = "cart-orders-service")
public interface CartOrdersClient {
    
    @GetMapping("/api/orders")
    List<OrderDTO> getAllOrdersForUser(@RequestHeader("X-User-Id") Long userId);
    
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrderById(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId);
    
    @GetMapping("/api/analytics/order-counts")
    Map<String, Long> getOrderCounts();
    
    @GetMapping("/api/analytics/revenue")
    Map<String, Double> getRevenue();
    
    @GetMapping("/api/analytics/order-status-distribution")
    Map<String, Long> getOrderStatusDistribution();
    
    @GetMapping("/api/analytics/top-products")
    List<Map<String, Object>> getTopProducts();

    @GetMapping("/api/analytics/sales-by-category")
    List<Map<String, Object>> getSalesByCategory();

    @GetMapping("/api/analytics/order-series")
    List<Map<String, Object>> getOrderSeries(@RequestParam("range") String range);

    @GetMapping("/api/analytics/revenue-series")
    List<Map<String, Object>> getRevenueSeries(@RequestParam("range") String range);

    @GetMapping("/api/analytics/sales-report")
    Map<String, Object> getSalesReport(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate);
}
