package com.medicart.admin.service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.medicart.admin.entity.Batch;
import com.medicart.admin.entity.Medicine;
import com.medicart.admin.repository.BatchRepository;
import com.medicart.admin.repository.MedicineRepository;
import com.medicart.common.dto.MedicineDTO;

@Service
public class MedicineService {
    private static final Logger log = LoggerFactory.getLogger(MedicineService.class);

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private BatchRepository batchRepository;

    public MedicineDTO createMedicine(MedicineDTO medicineDTO) {
        Medicine medicine = Medicine.builder()
                .name(medicineDTO.getName())
                .category(medicineDTO.getCategory())
                .price(medicineDTO.getPrice())
                .sku(medicineDTO.getSku())
                .requiresRx(medicineDTO.getRequiresRx() != null ? medicineDTO.getRequiresRx() : false)
                .description(medicineDTO.getDescription())
                .totalQuantity(medicineDTO.getTotalQuantity() != null ? medicineDTO.getTotalQuantity() : 0)
                .inStock(medicineDTO.getInStock() != null ? medicineDTO.getInStock() : true)
                .build();
        log.info("🚀 Creating medicine: {}", medicineDTO.getName());
        medicine = medicineRepository.save(medicine);
        return convertToDTO(medicine);
    }

    public List<MedicineDTO> getAllMedicines() {
        log.info("📚 Fetching all medicines...");
        List<MedicineDTO> medicines = medicineRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        log.info("✅ Returning {} medicines", medicines.size());
        return medicines;
    }

    public MedicineDTO getMedicineById(Long id) {
        log.info("🔍 Fetching medicine with id: {}", id);
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        return convertToDTO(medicine);
    }

    public MedicineDTO updateMedicine(Long id, MedicineDTO medicineDTO) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        medicine.setName(medicineDTO.getName());
        medicine.setCategory(medicineDTO.getCategory());
        medicine.setPrice(medicineDTO.getPrice());
        medicine.setRequiresRx(medicineDTO.getRequiresRx() != null ? medicineDTO.getRequiresRx() : medicine.getRequiresRx());
        medicine.setDescription(medicineDTO.getDescription());
        if (medicineDTO.getTotalQuantity() != null) {
            medicine.setTotalQuantity(medicineDTO.getTotalQuantity());
        }
        if (medicineDTO.getInStock() != null) {
            medicine.setInStock(medicineDTO.getInStock());
        }

        medicine = medicineRepository.save(medicine);
        return convertToDTO(medicine);
    }

    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    private MedicineDTO convertToDTO(Medicine medicine) {
        log.debug("🔄 Converting medicine {} to DTO", medicine.getId());
        // Calculate stock status based on batches
        String stockStatus = calculateStockStatus(medicine.getId());
        
        // ✅ Calculate total quantity from all batches
        Integer totalQtyFromBatches = calculateTotalQuantityFromBatches(medicine.getId());
        
        log.debug("📊 Quantity calculation for medicine {}: medicineEntity={}, fromBatches={}", 
                medicine.getId(), medicine.getTotalQuantity(), totalQtyFromBatches);

        MedicineDTO dto = new MedicineDTO(
                medicine.getId(),
                medicine.getName(),
                medicine.getCategory(),
                medicine.getPrice(),
                medicine.getSku(),
                medicine.getRequiresRx(),
                medicine.getDescription(),
                medicine.getInStock(),
                stockStatus,
                totalQtyFromBatches > 0 ? totalQtyFromBatches : medicine.getTotalQuantity()
        );
        
        log.debug("📦 DTO Created - Medicine: {}, StockStatus: {}, InStock: {}, TotalQty: {}", 
                medicine.getName(), stockStatus, medicine.getInStock(), totalQtyFromBatches > 0 ? totalQtyFromBatches : medicine.getTotalQuantity());
        
        return dto;
    }

    private String calculateStockStatus(Long medicineId) {
        try {
            log.debug("📊 Calculating stock status for medicineId: {}", medicineId);
            
            // Get all batches for this medicine
            List<Batch> batches = batchRepository.findByMedicineId(medicineId);

            log.debug("  Found {} batches for medicineId: {}", batches == null ? 0 : batches.size(), medicineId);

            // If no batches exist, out of stock
            if (batches == null || batches.isEmpty()) {
                log.debug("  ❌ NO BATCHES FOUND - Returning OUT_OF_STOCK");
                return "OUT_OF_STOCK";
            }

            LocalDate today = LocalDate.now();
            log.debug("  Today's date: {}", today);

            // Log all batches
            batches.forEach(batch -> {
                log.debug("    - Batch: {}, Expiry: {}, Qty: {}", 
                        batch.getId(), batch.getExpiryDate(), batch.getQtyAvailable());
            });

            // Check if there's at least one unexpired batch
            boolean hasUnexpiredBatch = batches.stream()
                    .anyMatch(batch -> batch.getExpiryDate() != null && batch.getExpiryDate().isAfter(today));

            log.debug("  Has unexpired batch: {}", hasUnexpiredBatch);

            // If all batches are expired
            if (!hasUnexpiredBatch) {
                log.debug("  ❌ ALL BATCHES EXPIRED - Returning EXPIRED");
                return "EXPIRED";
            }

            // If at least one unexpired batch exists
            log.debug("  ✅ UNEXPIRED BATCH EXISTS - Returning IN_STOCK");
            return "IN_STOCK";
        } catch (Exception e) {
            log.error("❌ Error calculating stock status for medicineId {}: {}", medicineId, e.getMessage(), e);
            return "IN_STOCK";
        }
    }

    private Integer calculateTotalQuantityFromBatches(Long medicineId) {
        try {
            log.debug("📦 Calculating total quantity from batches for medicineId: {}", medicineId);
            
            // Get all batches for this medicine
            List<Batch> batches = batchRepository.findByMedicineId(medicineId);

            if (batches == null || batches.isEmpty()) {
                log.debug("  ❌ NO BATCHES FOUND - Returning 0");
                return 0;
            }

            LocalDate today = LocalDate.now();

            // Sum quantities from unexpired batches only
            Integer totalQty = batches.stream()
                    .filter(batch -> batch.getExpiryDate() != null && batch.getExpiryDate().isAfter(today))
                    .mapToInt(batch -> batch.getQtyAvailable() != null ? batch.getQtyAvailable() : 0)
                    .sum();

            log.debug("  ✅ Total quantity from {} unexpired batches: {}", 
                    batches.stream().filter(b -> b.getExpiryDate().isAfter(today)).count(), totalQty);
            
            return totalQty;
        } catch (Exception e) {
            log.error("❌ Error calculating total quantity for medicineId {}: {}", medicineId, e.getMessage(), e);
            return 0;
        }
    }
}

