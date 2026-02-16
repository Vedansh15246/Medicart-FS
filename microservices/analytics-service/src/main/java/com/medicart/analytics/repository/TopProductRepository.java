package com.medicart.analytics.repository;

import com.medicart.analytics.entity.TopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopProductRepository extends JpaRepository<TopProduct, Long> {
    @Query("SELECT t FROM TopProduct t ORDER BY t.rankPosition LIMIT :limit")
    List<TopProduct> findTopProducts(int limit);
}
