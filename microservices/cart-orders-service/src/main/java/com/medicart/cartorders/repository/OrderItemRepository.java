package com.medicart.cartorders.repository;

import com.medicart.cartorders.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("select oi.medicineId, sum(oi.quantity), sum(oi.subtotal) from OrderItem oi group by oi.medicineId order by sum(oi.subtotal) desc")
    List<Object[]> findTopProducts(Pageable pageable);

    @Query("select oi.medicineId, sum(oi.subtotal) from OrderItem oi group by oi.medicineId")
    List<Object[]> findRevenueByMedicine();
}
