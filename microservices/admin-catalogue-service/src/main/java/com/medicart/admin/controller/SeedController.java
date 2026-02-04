package com.medicart.admin.controller;

import com.medicart.common.dto.MedicineDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/seed")
public class SeedController {

    @PostMapping("/medicines")
    public ResponseEntity<String> seedMedicines() {
        // Seed initial medicines into database
        List<MedicineDTO> medicines = new ArrayList<>();
        medicines.add(MedicineDTO.builder()
                .name("Aspirin")
                .category("Painkillers")
                .price(50.0)
                .sku("ASP001")
                .requiresRx(false)
                .description("Pain relief medicine")
                .totalQuantity(100)
                .inStock(true)
                .build());

        return ResponseEntity.ok("Medicines seeded successfully");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Admin-Catalogue Service is running on port 8082");
    }
}
