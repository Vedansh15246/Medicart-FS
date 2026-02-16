package com.medicart.analytics.repository;

import com.medicart.analytics.entity.OrderStatusDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderStatusDistributionRepository extends JpaRepository<OrderStatusDistribution, Long> {
    List<OrderStatusDistribution> findAllByOrderByCountDesc();
}
