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
            logger.info("📍 /api/orders/place called");
            logger.info("   X-User-Id header: '{}'", userIdStr);
            logger.info("   Request body: {}", requestBody);
            logger.info("   Request body type: {}", requestBody == null ? "NULL" : requestBody.getClass().getName());
            
            // Get addressId from request body
            String addressIdStr = null;
            if (requestBody != null && requestBody.containsKey("addressId")) {
                Object addressId = requestBody.get("addressId");
                addressIdStr = addressId != null ? addressId.toString() : null;
            }
            logger.info("   addressId extracted: '{}' (type: {})", addressIdStr, 
                requestBody != null && requestBody.get("addressId") != null ? 
                requestBody.get("addressId").getClass().getName() : "NULL");
            
            // ✅ EXPLICIT VALIDATION WITH ERROR DETAILS
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                logger.error("❌ MISSING X-User-Id header");
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Missing X-User-Id header", "status", "failed"));
            }
            
            if (addressIdStr == null || addressIdStr.trim().isEmpty()) {
                logger.error("❌ MISSING addressId parameter");
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Missing addressId parameter", "status", "failed"));
            }
            
            Long userId;
            Long addressId;
            try {
                userId = Long.parseLong(userIdStr.trim());
                addressId = Long.parseLong(addressIdStr.trim());
            } catch (NumberFormatException e) {
                logger.error("❌ Invalid format - userId: '{}', addressId: '{}'", userIdStr, addressIdStr);
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                        "error", "Invalid userId or addressId format",
                        "userId", userIdStr,
                        "addressId", addressIdStr,
                        "status", "failed"
                    ));
            }
            
            logger.info("✅ Parsed userId: {}, addressId: {}", userId, addressId);
            
            OrderDTO order = orderService.placeOrder(userId, addressId);
            logger.info("✅ Order created with ID: {}", order.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("❌ Exception while placing order: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(java.util.Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName(),
                    "status", "failed"
                ));
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(
            @RequestHeader("X-User-Id") Long userId) {
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
            @RequestParam String status,
            @RequestHeader("X-User-Id") Long userId) {
        OrderDTO order = orderService.updateOrderStatus(orderId, status, userId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/finalize-payment")
    public ResponseEntity<?> finalizePayment(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId) {
        logger.info("💳 [POST /api/orders/{}/finalize-payment] REQUEST RECEIVED - userId: {}", orderId, userId);
        
        try {
            // Update order status to CONFIRMED and reduce batch quantities
            orderService.finalizePayment(orderId, userId);
            logger.info("✅ [POST /api/orders/{}/finalize-payment] SUCCESS - Order finalized", orderId);
            return ResponseEntity.ok(java.util.Map.of("status", "success", "message", "Payment finalized"));
        } catch (Exception e) {
            logger.error("❌ [POST /api/orders/{}/finalize-payment] ERROR - {}", orderId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("status", "failed", "error", e.getMessage()));
        }
    }
}
