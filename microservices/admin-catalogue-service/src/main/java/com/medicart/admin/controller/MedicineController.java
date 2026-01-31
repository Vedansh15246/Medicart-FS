package com.medicart.admin.controller;

import com.medicart.common.dto.MedicineDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    @GetMapping
    public ResponseEntity<List<MedicineDTO>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Mock data for demonstration
        List<MedicineDTO> medicines = new ArrayList<>();
        medicines.add(MedicineDTO.builder()
                .id(1L)
                .name("Aspirin")
                .category("Painkillers")
                .price(50.0)
                .sku("ASP001")
                .requiresRx(false)
                .description("Pain relief medicine")
                .totalQuantity(100)
                .inStock(true)
                .stockStatus("IN_STOCK")
                .build());
        medicines.add(MedicineDTO.builder()
                .id(2L)
                .name("Ibuprofen")
                .category("Anti-inflammatory")
                .price(75.0)
                .sku("IBU001")
                .requiresRx(false)
                .description("Anti-inflammatory medicine")
                .totalQuantity(150)
                .inStock(true)
                .stockStatus("IN_STOCK")
                .build());
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        MedicineDTO medicine = MedicineDTO.builder()
                .id(id)
                .name("Aspirin")
                .category("Painkillers")
                .price(50.0)
                .sku("ASP001")
                .requiresRx(false)
                .description("Pain relief medicine")
                .totalQuantity(100)
                .inStock(true)
                .stockStatus("IN_STOCK")
                .build();
        return ResponseEntity.ok(medicine);
    }

    @PostMapping
    public ResponseEntity<MedicineDTO> createMedicine(@RequestBody MedicineDTO medicineDTO) {
        medicineDTO.setId(1L);
        return ResponseEntity.ok(medicineDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineDTO> updateMedicine(@PathVariable Long id, @RequestBody MedicineDTO medicineDTO) {
        medicineDTO.setId(id);
        return ResponseEntity.ok(medicineDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicineDTO>> searchMedicines(@RequestParam String query) {
        List<MedicineDTO> medicines = new ArrayList<>();
        return ResponseEntity.ok(medicines);
    }
}

