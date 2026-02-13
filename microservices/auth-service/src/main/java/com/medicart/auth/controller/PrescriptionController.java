package com.medicart.auth.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/prescriptions", "/api/prescriptions"})
public class PrescriptionController {
    private static final Logger log = LoggerFactory.getLogger(PrescriptionController.class);
    
    // In-memory storage for prescriptions (userId -> List of prescriptions)
    private static final Map<Long, List<Map<String, Object>>> prescriptionStorage = new ConcurrentHashMap<>();
    // In-memory storage for file data (prescriptionId -> file bytes)
    private static final Map<String, byte[]> fileStorage = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPrescriptions(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            List<Map<String, Object>> prescriptions = prescriptionStorage.getOrDefault(userId, new ArrayList<>());
            log.debug("Returning {} prescriptions for userId: {}", prescriptions.size(), userId);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            log.error("Error fetching prescriptions - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            // Debug logs to confirm headers and content type for troubleshooting 403/invalid requests
            String contentType = (file != null) ? file.getContentType() : "<no-file>";
            log.debug("uploadPrescription called - userId: {}, request content-type (multipart file): {}", userId, contentType);

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            String prescriptionId = UUID.randomUUID().toString();
            byte[] fileBytes = file.getBytes();
            fileStorage.put(prescriptionId, fileBytes);

            Map<String, Object> prescription = new HashMap<>();
            prescription.put("id", prescriptionId);
            prescription.put("fileName", file.getOriginalFilename());
            prescription.put("fileSize", file.getSize());
            prescription.put("uploadedDate", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            prescription.put("userId", userId);

            prescriptionStorage.computeIfAbsent(userId, k -> new ArrayList<>())
                    .add(prescription);

            log.info("Prescription uploaded - userId: {}, prescriptionId: {}", userId, prescriptionId);

            return ResponseEntity.ok(Map.of(
                    "id", prescriptionId,
                    "message", "File uploaded successfully",
                    "fileName", file.getOriginalFilename(),
                    "userId", userId,
                    "uploadedDate", prescription.get("uploadedDate")
            ));
        } catch (Exception e) {
            log.error("Error uploading prescription - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadPrescription(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            byte[] fileBytes = fileStorage.get(id);
            if (fileBytes == null) {
                return ResponseEntity.notFound().build();
            }

            String fileName = "prescription.pdf";
            for (List<Map<String, Object>> userPrescriptions : prescriptionStorage.values()) {
                for (Map<String, Object> prescription : userPrescriptions) {
                    if (prescription.get("id").equals(id)) {
                        fileName = (String) prescription.get("fileName");
                        break;
                    }
                }
            }

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(fileBytes);
        } catch (Exception e) {
            log.error("Error downloading prescription - prescriptionId: {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

