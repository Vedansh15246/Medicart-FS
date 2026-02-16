package com.medicart.cartorders.repository;

import com.medicart.cartorders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
    long countByOrderDateAfter(LocalDateTime start);
    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o")
    Double sumTotalAmount();

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.orderDate >= :start")
    Double sumTotalAmountAfter(@Param("start") LocalDateTime start);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.orderDate between :start and :end")
    Double sumTotalAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select o.status, count(o) from Order o group by o.status")
    List<Object[]> countOrdersByStatus();
}
