package com.medicart.admin.controller;

import com.medicart.common.dto.BatchDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/batches")
@CrossOrigin(origins = "*")
public class BatchController {

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getAllBatches() {
        List<BatchDTO> batches = new ArrayList<>();
        batches.add(BatchDTO.builder()
                .id(1L)
                .batchNo("BATCH001")
                .expiryDate(LocalDate.now().plusMonths(6))
                .qtyAvailable(50)
                .medicineId(1L)
                .medicineName("Aspirin")
                .build());
        return ResponseEntity.ok(batches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatchById(@PathVariable Long id) {
        BatchDTO batch = BatchDTO.builder()
                .id(id)
                .batchNo("BATCH001")
                .expiryDate(LocalDate.now().plusMonths(6))
                .qtyAvailable(50)
                .medicineId(1L)
                .medicineName("Aspirin")
                .build();
        return ResponseEntity.ok(batch);
    }

    @GetMapping("/{medicineId}/available")
    public ResponseEntity<List<BatchDTO>> getAvailableBatches(@PathVariable Long medicineId) {
        List<BatchDTO> batches = new ArrayList<>();
        batches.add(BatchDTO.builder()
                .id(1L)
                .batchNo("BATCH001")
                .expiryDate(LocalDate.now().plusMonths(3))
                .qtyAvailable(30)
                .medicineId(medicineId)
                .medicineName("Medicine")
                .build());
        batches.add(BatchDTO.builder()
                .id(2L)
                .batchNo("BATCH002")
                .expiryDate(LocalDate.now().plusMonths(6))
                .qtyAvailable(50)
                .medicineId(medicineId)
                .medicineName("Medicine")
                .build());
        return ResponseEntity.ok(batches);
    }

    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(@RequestBody BatchDTO batchDTO) {
        batchDTO.setId(1L);
        return ResponseEntity.ok(batchDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatchDTO> updateBatch(@PathVariable Long id, @RequestBody BatchDTO batchDTO) {
        batchDTO.setId(id);
        return ResponseEntity.ok(batchDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
