package com.medicart.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping({"/prescriptions", "/api/prescriptions"})
public class PrescriptionController {
    private static final Logger log = LoggerFactory.getLogger(PrescriptionController.class);
    
    // In-memory storage for prescriptions (userId -> List of prescriptions)
    private static final Map<Long, List<Map<String, Object>>> prescriptionStorage = new ConcurrentHashMap<>();
    // In-memory storage for file data (prescriptionId -> file bytes)
    private static final Map<String, byte[]> fileStorage = new ConcurrentHashMap<>();

    /**
     * Get user's prescription history
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPrescriptions(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        try {
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("📋 GET /prescriptions REQUEST RECEIVED");
            log.info("  Path: {}", request.getRequestURI());
            log.info("  X-User-Id Header: {}", userId);
            log.info("  Authorization Header Present: {}", authHeader != null);
            if (authHeader != null) {
                log.info("  Auth Header Length: {}", authHeader.length());
                log.info("  Auth Header Type: {}", authHeader.startsWith("Bearer") ? "Bearer" : "Other");
            }
            log.info("═══════════════════════════════════════════════════════════════");
            
            // Get prescriptions for this user
            List<Map<String, Object>> prescriptions = prescriptionStorage.getOrDefault(userId, new ArrayList<>());
            log.info("✅ RESPONSE: Returning {} prescriptions for userId: {}", prescriptions.size(), userId);
            
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            log.error("❌ ERROR fetching prescriptions (userId: {}): {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Upload a new prescription file
     */
    @PostMapping
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        try {
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("📤 POST /prescriptions REQUEST RECEIVED");
            log.info("  Path: {}", request.getRequestURI());
            log.info("  Method: {}", request.getMethod());
            log.info("  Content-Type: {}", request.getContentType());
            log.info("  X-User-Id Header: {}", userId);
            log.info("  Authorization Header Present: {}", authHeader != null);
            if (authHeader != null) {
                log.info("  Auth Header Length: {}", authHeader.length());
            }
            log.info("  File Name: {}", file.getOriginalFilename());
            log.info("  File Size: {} bytes", file.getSize());
            log.info("═══════════════════════════════════════════════════════════════");
            
            if (file.isEmpty()) {
                log.warn("⚠️ Upload failed - file is empty (userId: {})", userId);
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Validate file size (5MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                log.warn("⚠️ Upload failed - file exceeds 5MB limit (userId: {}, size: {} bytes)", 
                        userId, file.getSize());
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            // Generate unique prescription ID
            String prescriptionId = UUID.randomUUID().toString();
            
            // Store file bytes in memory
            byte[] fileBytes = file.getBytes();
            fileStorage.put(prescriptionId, fileBytes);
            log.info("📁 File stored in memory - prescriptionId: {}, size: {} bytes", prescriptionId, fileBytes.length);
            
            // Create prescription record
            Map<String, Object> prescription = new HashMap<>();
            prescription.put("id", prescriptionId);
            prescription.put("fileName", file.getOriginalFilename());
            prescription.put("fileSize", file.getSize());
            prescription.put("uploadedDate", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            prescription.put("userId", userId);
            
            // Store in user's prescription list
            prescriptionStorage.computeIfAbsent(userId, k -> new ArrayList<>())
                    .add(prescription);
            
            log.info("✅ Prescription stored - userId: {}, prescriptionId: {}, fileName: {}", 
                    userId, prescriptionId, file.getOriginalFilename());

            Map<String, Object> response = Map.of(
                    "id", prescriptionId,
                    "message", "File uploaded successfully",
                    "fileName", file.getOriginalFilename(),
                    "userId", userId,
                    "uploadedDate", prescription.get("uploadedDate")
            );
            log.info("✅ RESPONSE: File uploaded successfully - userId: {}", userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ ERROR uploading prescription (userId: {}): {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Download a prescription file
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadPrescription(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        try {
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("📥 GET /prescriptions/{} DOWNLOAD REQUEST RECEIVED", id);
            log.info("  Path: {}", request.getRequestURI());
            log.info("  X-User-Id Header: {}", userId);
            log.info("  Authorization Header Present: {}", authHeader != null);
            log.info("═══════════════════════════════════════════════════════════════");
            
            // Retrieve file from storage
            byte[] fileBytes = fileStorage.get(id);
            if (fileBytes == null) {
                log.error("❌ Prescription not found - prescriptionId: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Find prescription details from storage to get file name
            String fileName = "prescription.pdf";
            for (List<Map<String, Object>> userPrescriptions : prescriptionStorage.values()) {
                for (Map<String, Object> prescription : userPrescriptions) {
                    if (prescription.get("id").equals(id)) {
                        fileName = (String) prescription.get("fileName");
                        break;
                    }
                }
            }
            
            log.info("✅ RESPONSE: Returning file - prescriptionId: {}, fileName: {}, size: {} bytes", 
                    id, fileName, fileBytes.length);
            
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(fileBytes);
        } catch (Exception e) {
            log.error("❌ ERROR downloading prescription (userId: {}, prescriptionId: {}): {}", 
                    userId, id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

