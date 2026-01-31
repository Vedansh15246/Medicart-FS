package com.medicart.payment.client;

import com.medicart.common.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "cart-orders-service")
public interface CartOrdersClient {
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrder(@PathVariable Long orderId);

    @PutMapping("/api/orders/{orderId}/status")
    void updateOrderStatus(@PathVariable Long orderId, @RequestParam String status);
}
