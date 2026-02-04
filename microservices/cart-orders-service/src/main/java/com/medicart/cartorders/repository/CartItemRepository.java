package com.medicart.cartorders.repository;

import com.medicart.cartorders.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndMedicineId(Long userId, Long medicineId);
    void deleteByUserId(Long userId);
}
