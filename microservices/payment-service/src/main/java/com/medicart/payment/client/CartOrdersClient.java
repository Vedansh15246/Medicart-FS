package com.medicart.payment.client;

import com.medicart.common.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "cart-orders-service")
public interface CartOrdersClient {
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrder(@PathVariable Long orderId);

    @PutMapping("/api/orders/{orderId}/status")
    void updateOrderStatus(@PathVariable Long orderId, @RequestParam String status);

    // ✅ NEW: Clear cart after successful payment
    @DeleteMapping("/api/cart/clear")
    void clearCart(@RequestHeader("X-User-Id") Long userId);

    // ✅ NEW: Finalize payment - updates order status and reduces batch quantities
    @PostMapping("/api/orders/{orderId}/finalize-payment")
    void finalizePayment(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId);
}
