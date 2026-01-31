package com.medicart.cartorders.controller;

import com.medicart.cartorders.service.OrderService;
import com.medicart.common.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<OrderDTO> placeOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long addressId) {
        try {
            OrderDTO order = orderService.placeOrder(userId, addressId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
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
}
