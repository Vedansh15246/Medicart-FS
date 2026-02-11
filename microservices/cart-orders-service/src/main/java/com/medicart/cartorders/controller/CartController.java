package com.medicart.cartorders.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.cartorders.client.MedicineClient;
import com.medicart.cartorders.service.CartService;
import com.medicart.common.dto.CartItemDTO;
import com.medicart.common.dto.MedicineDTO;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    @Autowired
    private MedicineClient medicineClient;

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam Long medicineId,
            @RequestParam Integer quantity) {
                
        if (userId == null) {
            return ResponseEntity.status(403).build();
        }
        
        MedicineDTO medicineDTO = medicineClient.getMedicineById(medicineId);
        if (medicineDTO == null) {
            return ResponseEntity.badRequest().build();
        }

        CartItemDTO cartItem =
                cartService.addToCart(userId, medicineId, quantity, medicineDTO);
        
        return ResponseEntity.ok(cartItem);
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(
         @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @PathVariable Long itemId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam Integer quantity) {
        
        
        if (userId == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
            cartService.updateCartItem(itemId, quantity, userId)
        );
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long itemId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        log.info("🛒 [DELETE /api/cart/remove/{}] REQUEST RECEIVED - userId: {}", itemId, userId);
        
        if (userId == null) {
            log.error("❌ X-User-Id header is MISSING or null");
            return ResponseEntity.status(403).build();
        }

        cartService.removeFromCart(itemId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        log.info("🛒 [DELETE /api/cart/clear] REQUEST RECEIVED - userId: {}", userId);
        
        if (userId == null) {
            log.error("❌ X-User-Id header is MISSING or null");
            return ResponseEntity.status(403).build();
        }

        cartService.clearUserCart(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getTotal(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        log.info("🛒 [GET /api/cart/total] REQUEST RECEIVED - userId: {}", userId);
        
        if (userId == null) {
            log.error("❌ X-User-Id header is MISSING or null");
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(cartService.getCartTotal(userId));
    }
}
