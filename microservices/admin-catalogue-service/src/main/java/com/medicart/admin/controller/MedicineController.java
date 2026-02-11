package com.medicart.admin.controller;

import com.medicart.admin.service.MedicineService;
import com.medicart.common.dto.MedicineDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    public ResponseEntity<List<MedicineDTO>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<MedicineDTO> medicines = medicineService.getAllMedicines();
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        MedicineDTO medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(medicine);
    }

    @PostMapping
    public ResponseEntity<MedicineDTO> createMedicine(@RequestBody MedicineDTO medicineDTO) {
        MedicineDTO created = medicineService.createMedicine(medicineDTO);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineDTO> updateMedicine(@PathVariable Long id, @RequestBody MedicineDTO medicineDTO) {
        MedicineDTO updated = medicineService.updateMedicine(id, medicineDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicineDTO>> searchMedicines(@RequestParam String query) {
        List<MedicineDTO> medicines = medicineService.getAllMedicines()
                .stream()
                .filter(m -> m.getName().toLowerCase().contains(query.toLowerCase()) || 
                           m.getCategory().toLowerCase().contains(query.toLowerCase()))
                .toList();
        return ResponseEntity.ok(medicines);
    }
}

