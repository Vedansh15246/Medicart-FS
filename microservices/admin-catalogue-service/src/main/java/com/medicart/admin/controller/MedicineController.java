package com.medicart.admin.controller;

import com.medicart.admin.service.MedicineService;
import com.medicart.common.dto.MedicineDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    private static final Logger log = LoggerFactory.getLogger(MedicineController.class);
    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    private void logSecurityContext(String methodName) {
        log.debug("════════════════════════════════════════════════════════════════");
        log.debug("🎯 [MedicineController.{}] SECURITY CONTEXT CHECK", methodName);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            log.debug("   ❌ Authentication: NULL");
        } else {
            log.debug("   ✅ Authentication: EXISTS");
            log.debug("   Principal: {}", auth.getPrincipal());
            log.debug("   Authorities: {}", auth.getAuthorities());
            log.debug("   Authenticated: {}", auth.isAuthenticated());
        }
        log.debug("════════════════════════════════════════════════════════════════");
    }

    @GetMapping
    public ResponseEntity<List<MedicineDTO>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.debug("🔷 [GET /medicines] REQUEST RECEIVED");
        logSecurityContext("getAllMedicines");
        
        List<MedicineDTO> medicines = medicineService.getAllMedicines();
        log.debug("✅ [GET /medicines] RESPONSE SENT: {} medicines", medicines.size());
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        log.debug("🔷 [GET /medicines/{}] REQUEST RECEIVED", id);
        logSecurityContext("getMedicineById");
        
        MedicineDTO medicine = medicineService.getMedicineById(id);
        log.debug("✅ [GET /medicines/{}] RESPONSE SENT", id);
        return ResponseEntity.ok(medicine);
    }

    @PostMapping
    public ResponseEntity<MedicineDTO> createMedicine(@RequestBody MedicineDTO medicineDTO) {
        log.debug("🔶 [POST /medicines] REQUEST RECEIVED");
        log.debug("   Body: {}", medicineDTO);
        logSecurityContext("createMedicine");
        
        MedicineDTO created = medicineService.createMedicine(medicineDTO);
        log.debug("✅ [POST /medicines] RESPONSE SENT: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineDTO> updateMedicine(@PathVariable Long id, @RequestBody MedicineDTO medicineDTO) {
        log.debug("🔶 [PUT /medicines/{}] REQUEST RECEIVED", id);
        log.debug("   Body: {}", medicineDTO);
        logSecurityContext("updateMedicine");
        
        MedicineDTO updated = medicineService.updateMedicine(id, medicineDTO);
        log.debug("✅ [PUT /medicines/{}] RESPONSE SENT", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        log.debug("🔴 [DELETE /medicines/{}] REQUEST RECEIVED", id);
        logSecurityContext("deleteMedicine");
        
        medicineService.deleteMedicine(id);
        log.debug("✅ [DELETE /medicines/{}] RESPONSE SENT", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicineDTO>> searchMedicines(@RequestParam String query) {
        log.debug("🔷 [GET /medicines/search?query={}] REQUEST RECEIVED", query);
        logSecurityContext("searchMedicines");
        
        List<MedicineDTO> medicines = medicineService.getAllMedicines()
                .stream()
                .filter(m -> m.getName().toLowerCase().contains(query.toLowerCase()) || 
                           m.getCategory().toLowerCase().contains(query.toLowerCase()))
                .toList();
        log.debug("✅ [GET /medicines/search] RESPONSE SENT: {} results", medicines.size());
        return ResponseEntity.ok(medicines);
    }
}

