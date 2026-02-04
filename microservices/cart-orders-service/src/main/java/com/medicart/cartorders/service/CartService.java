package com.medicart.cartorders.service;

import com.medicart.cartorders.client.MedicineClient;
import com.medicart.cartorders.entity.CartItem;
import com.medicart.cartorders.repository.CartItemRepository;
import com.medicart.common.dto.CartItemDTO;
import com.medicart.common.dto.MedicineDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private MedicineClient medicineClient;

    /**
     * ADD TO CART (UPSERT)
     */
    public CartItemDTO addToCart(Long userId, Long medicineId, Integer quantity, MedicineDTO medicineDTO) {

        CartItem cartItem = cartItemRepository
                .findByUserIdAndMedicineId(userId, medicineId)
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = CartItem.builder()
                    .userId(userId)
                    .medicineId(medicineId)
                    .quantity(quantity)
                    .price(medicineDTO.getPrice())
                    .inStock(medicineDTO.getInStock())
                    .build();
        }

        cartItem = cartItemRepository.save(cartItem);

        return convertToDTO(cartItem, medicineDTO);
    }

    /**
     * UPDATE CART ITEM
     */
    public CartItemDTO updateCartItem(Long itemId, Integer quantity, Long userId) {

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized cart update");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);

        // 🔥 FIX: fetch full medicine details
        MedicineDTO medicineDTO =
                medicineClient.getMedicineById(cartItem.getMedicineId());

        return convertToDTO(cartItem, medicineDTO);
    }

    /**
     * GET USER CART  ✅ FIXED
     */
    public List<CartItemDTO> getUserCart(Long userId) {

        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(cartItem -> {
                    // 🔥 FIX: enrich cart with medicine service
                    MedicineDTO medicineDTO =
                            medicineClient.getMedicineById(cartItem.getMedicineId());

                    return convertToDTO(cartItem, medicineDTO);
                })
                .collect(Collectors.toList());
    }

    /**
     * REMOVE ITEM
     */
    public void removeFromCart(Long itemId, Long userId) {

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized cart delete");
        }

        cartItemRepository.delete(cartItem);
    }

    /**
     * CLEAR CART
     */
    public void clearUserCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    /**
     * CART TOTAL
     */
    public Double getCartTotal(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    /**
     * DTO MAPPER
     */
    private CartItemDTO convertToDTO(CartItem cartItem, MedicineDTO medicineDTO) {

        return CartItemDTO.builder()
                .id(cartItem.getId())
                .userId(cartItem.getUserId())
                .medicineId(cartItem.getMedicineId())
                .medicineName(medicineDTO.getName()) // ✅ now available
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .inStock(cartItem.getInStock())
                .medicine(medicineDTO) // ✅ full medicine object
                .build();
    }
}
