package com.medicart.admin.repository;

import com.medicart.admin.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByMedicineId(Long medicineId);
    
    @Query("SELECT b FROM Batch b WHERE b.medicine.id = :medicineId ORDER BY b.expiryDate ASC")
    List<Batch> findByMedicineIdOrderByExpiryDate(Long medicineId);
}
