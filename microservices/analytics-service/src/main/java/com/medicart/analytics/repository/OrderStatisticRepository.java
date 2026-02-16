package com.medicart.analytics.repository;

import com.medicart.analytics.entity.OrderStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderStatisticRepository extends JpaRepository<OrderStatistic, Long> {
    @Query("SELECT o FROM OrderStatistic o ORDER BY o.computedAt DESC LIMIT 1")
    Optional<OrderStatistic> findLatest();
}
