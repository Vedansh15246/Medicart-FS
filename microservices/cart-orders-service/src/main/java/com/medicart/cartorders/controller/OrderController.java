package com.medicart.cartorders.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.cartorders.service.OrderService;
import com.medicart.common.dto.OrderDTO;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> requestBody) {
        try {
            String addressIdStr = null;
            if (requestBody != null && requestBody.containsKey("addressId")) {
                Object addressId = requestBody.get("addressId");
                addressIdStr = addressId != null ? addressId.toString() : null;
            }
            
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Missing X-User-Id header", "status", "failed"));
            }
            
            if (addressIdStr == null || addressIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Missing addressId parameter", "status", "failed"));
            }
            
            Long userId;
            Long addressId;
            try {
                userId = Long.parseLong(userIdStr.trim());
                addressId = Long.parseLong(addressIdStr.trim());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                        "error", "Invalid userId or addressId format",
                        "status", "failed"
                    ));
            }
            
            OrderDTO order = orderService.placeOrder(userId, addressId);
            logger.info("Order placed - orderId: {}, userId: {}", order.getId(), userId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Failed to place order: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(java.util.Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName(),
                    "status", "failed"
                ));
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getOrders(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "admin", required = false) Boolean admin) {
        if (Boolean.TRUE.equals(admin)) {
            logger.info("Admin request: fetching ALL orders");
            List<OrderDTO> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        }
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId) {
        OrderDTO order = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            @RequestHeader("X-User-Id") Long userId) {
        String status = body.get("status");
        OrderDTO order = orderService.updateOrderStatus(orderId, status, userId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDTO> updateOrder(
            @PathVariable Long orderId,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            @RequestHeader("X-User-Id") Long userId) {
        String status = body.get("status");
        String deliveryDate = body.get("deliveryDate");
        OrderDTO order = orderService.updateOrder(orderId, status, deliveryDate);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/finalize-payment")
    public ResponseEntity<?> finalizePayment(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            orderService.finalizePayment(orderId, userId);
            return ResponseEntity.ok(java.util.Map.of("status", "success", "message", "Payment finalized"));
        } catch (Exception e) {
            logger.error("Failed to finalize payment - orderId: {}: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("status", "failed", "error", e.getMessage()));
        }
    }
}
