package com.medicart.analytics.repository;

import com.medicart.analytics.entity.SalesByCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalesByCategoryRepository extends JpaRepository<SalesByCategory, Long> {
    List<SalesByCategory> findAllByOrderByTotalRevenueDesc();
}
