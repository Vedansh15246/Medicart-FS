package com.medicart.analytics.repository;

import com.medicart.analytics.entity.RevenueDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RevenueDetailRepository extends JpaRepository<RevenueDetail, Long> {
    @Query("SELECT r FROM RevenueDetail r ORDER BY r.computedAt DESC LIMIT 1")
    Optional<RevenueDetail> findLatest();
}
