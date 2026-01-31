package com.medicart.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadPrescription(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String fileName) {
        Map<String, Object> response = new HashMap<>();
        response.put("prescriptionId", 1L);
        response.put("fileName", fileName);
        response.put("uploadedAt", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPrescriptions(
            @RequestHeader("X-User-Id") Long userId) {
        List<Map<String, Object>> prescriptions = new ArrayList<>();
        Map<String, Object> prescription = new HashMap<>();
        prescription.put("id", 1L);
        prescription.put("fileName", "prescription_001.pdf");
        prescription.put("uploadedAt", System.currentTimeMillis());
        prescriptions.add(prescription);
        return ResponseEntity.ok(prescriptions);
    }

    @DeleteMapping("/{prescriptionId}")
    public ResponseEntity<Void> deletePrescription(
            @PathVariable Long prescriptionId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.noContent().build();
    }
}
