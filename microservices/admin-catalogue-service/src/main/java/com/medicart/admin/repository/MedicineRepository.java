package com.medicart.admin.repository;

import com.medicart.admin.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findBySku(String sku);
    List<Medicine> findByCategory(String category);
    List<Medicine> findByInStockTrue();
}
