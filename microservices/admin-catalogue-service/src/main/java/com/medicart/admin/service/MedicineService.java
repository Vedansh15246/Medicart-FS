package com.medicart.admin.service;

import com.medicart.admin.entity.Medicine;
import com.medicart.admin.repository.MedicineRepository;
import com.medicart.common.dto.MedicineDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {
    @Autowired
    private MedicineRepository medicineRepository;

    public MedicineDTO createMedicine(MedicineDTO medicineDTO) {
        Medicine medicine = Medicine.builder()
                .name(medicineDTO.getName())
                .category(medicineDTO.getCategory())
                .price(medicineDTO.getPrice())
                .sku(medicineDTO.getSku())
                .requiresRx(medicineDTO.getRequiresRx())
                .description(medicineDTO.getDescription())
                .totalQuantity(medicineDTO.getTotalQuantity())
                .inStock(medicineDTO.getInStock())
                .build();

        medicine = medicineRepository.save(medicine);
        return convertToDTO(medicine);
    }

    public List<MedicineDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MedicineDTO getMedicineById(Long id) {
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
        medicine.setRequiresRx(medicineDTO.getRequiresRx());
        medicine.setDescription(medicineDTO.getDescription());

        medicine = medicineRepository.save(medicine);
        return convertToDTO(medicine);
    }

    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    private MedicineDTO convertToDTO(Medicine medicine) {
        return new MedicineDTO(
                medicine.getId(),
                medicine.getName(),
                medicine.getCategory(),
                medicine.getPrice(),
                medicine.getSku(),
                medicine.getRequiresRx(),
                medicine.getDescription(),
                medicine.getInStock(),
                "IN_STOCK",
                medicine.getTotalQuantity()
        );
    }
}
