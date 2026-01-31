package com.medicart.cartorders.service;

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

    /**
     * Add item to cart - UPSERT pattern
     * If item exists, update quantity; otherwise create new item
     */
    public CartItemDTO addToCart(Long userId, Long medicineId, Integer quantity, MedicineDTO medicineDTO) {
        CartItem cartItem = cartItemRepository.findByUserIdAndMedicineId(userId, medicineId)
                .orElse(null);

        if (cartItem != null) {
            // Update existing item
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            // Create new item
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
     * Update cart item quantity
     */
    public CartItemDTO updateCartItem(Long itemId, Integer quantity, Long userId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this cart item");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);

        MedicineDTO medicineDTO = new MedicineDTO();
        medicineDTO.setId(cartItem.getMedicineId());
        medicineDTO.setPrice(cartItem.getPrice());

        return convertToDTO(cartItem, medicineDTO);
    }

    /**
     * Remove item from cart
     */
    public void removeFromCart(Long itemId, Long userId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to remove this cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    /**
     * Get user's cart
     */
    public List<CartItemDTO> getUserCart(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(item -> {
                    MedicineDTO medicineDTO = new MedicineDTO();
                    medicineDTO.setId(item.getMedicineId());
                    medicineDTO.setPrice(item.getPrice());
                    return convertToDTO(item, medicineDTO);
                })
                .collect(Collectors.toList());
    }

    /**
     * Clear user's cart (after order placement)
     */
    public void clearUserCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    /**
     * Get cart total
     */
    public Double getCartTotal(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    private CartItemDTO convertToDTO(CartItem cartItem, MedicineDTO medicineDTO) {
        return CartItemDTO.builder()
                .id(cartItem.getId())
                .userId(cartItem.getUserId())
                .medicineId(cartItem.getMedicineId())
                .medicineName(medicineDTO.getName())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .inStock(cartItem.getInStock())
                .build();
    }
}
