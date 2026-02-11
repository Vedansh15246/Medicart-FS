package com.medicart.admin.service;

import com.medicart.admin.entity.Batch;
import com.medicart.admin.entity.Medicine;
import com.medicart.admin.repository.BatchRepository;
import com.medicart.admin.repository.MedicineRepository;
import com.medicart.common.dto.BatchDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BatchService {

    private final BatchRepository batchRepository;
    private final MedicineRepository medicineRepository;

    public BatchService(BatchRepository batchRepository,
                        MedicineRepository medicineRepository) {
        this.batchRepository = batchRepository;
        this.medicineRepository = medicineRepository;
    }

    // ✅ READ - All batches
    public List<BatchDTO> getAllBatches() {
        return batchRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ READ - Available batches for a medicine (FIFO sorted by expiry date)
    public List<BatchDTO> getAvailableBatches(Long medicineId) {
        return batchRepository.findByMedicineIdOrderByExpiryDate(medicineId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ CREATE
    public BatchDTO createBatch(BatchDTO dto) {
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        Batch batch = Batch.builder()
                .medicine(medicine)
                .batchNo(dto.getBatchNo())
                .expiryDate(dto.getExpiryDate())
                .qtyAvailable(dto.getQtyAvailable())
                .qtyTotal(dto.getQtyAvailable())
                .build();

        return toDTO(batchRepository.save(batch));
    }

    // ✅ UPDATE
    public BatchDTO updateBatch(Long id, BatchDTO dto) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        batch.setMedicine(medicine);
        batch.setBatchNo(dto.getBatchNo());
        batch.setExpiryDate(dto.getExpiryDate());
        batch.setQtyAvailable(dto.getQtyAvailable());
        batch.setQtyTotal(dto.getQtyAvailable());

        return toDTO(batchRepository.save(batch));
    }

    // ✅ DELETE
    public void deleteBatch(Long id) {
        if (!batchRepository.existsById(id)) {
            throw new RuntimeException("Batch not found");
        }
        batchRepository.deleteById(id);
    }

    // ✅ REDUCE BATCH QUANTITY (after order payment succeeds)
    // Called after payment is confirmed to reduce available stock
    public void reduceBatchQuantity(Long batchId, Integer quantityOrdered) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Integer currentAvailable = batch.getQtyAvailable();
        
        if (currentAvailable < quantityOrdered) {
            throw new RuntimeException("Insufficient quantity in batch " + batchId + 
                    ". Available: " + currentAvailable + ", Ordered: " + quantityOrdered);
        }

        // Reduce the available quantity
        batch.setQtyAvailable(currentAvailable - quantityOrdered);
        batchRepository.save(batch);
    }

    // 🔁 Mapper
    private BatchDTO toDTO(Batch batch) {
        return BatchDTO.builder()
                .id(batch.getId())
                .batchNo(batch.getBatchNo())
                .expiryDate(batch.getExpiryDate())
                .qtyAvailable(batch.getQtyAvailable())
                .medicineId(batch.getMedicine().getId())
                .medicineName(batch.getMedicine().getName())
                .build();
    }
}
