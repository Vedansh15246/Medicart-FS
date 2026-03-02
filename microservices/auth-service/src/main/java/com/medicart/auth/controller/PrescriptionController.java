/*
 * ========================================
 * PRESCRIPTION CONTROLLER - FILE MANAGEMENT
 * ========================================
 * This controller handles prescription file uploads and downloads.
 * 
 * BASE URL: /prescriptions or /api/prescriptions
 * 
 * WHAT THIS CONTROLLER DOES:
 * ✅ Upload prescription files (PDF, images)
 * ✅ Get user's prescriptions list
 * ✅ Download prescription files
 * ✅ Admin: View any user's prescriptions
 * 
 * STORAGE:
 * Files are stored IN MEMORY (lost on restart)
 * In production, use database or cloud storage (S3, Azure Blob)
 */

package com.medicart.auth.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

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
    
    // In-memory storage: userId -> List of prescriptions
    private static final Map<Long, List<Map<String, Object>>> prescriptionStorage = new ConcurrentHashMap<>();
    
    // In-memory storage: prescriptionId -> file bytes
    private static final Map<String, byte[]> fileStorage = new ConcurrentHashMap<>();

    /*
     * GET USER'S PRESCRIPTIONS
     * Endpoint: GET /prescriptions
     * Access: Protected (requires JWT token)
     * 
     * Returns list of all prescriptions for logged-in user
     * 
     * Response: [
     *   {
     *     "id": "uuid",
     *     "fileName": "prescription.pdf",
     *     "fileSize": 12345,
     *     "uploadedDate": "2024-01-01T10:00:00",
     *     "userId": 1
     *   }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPrescriptions(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            List<Map<String, Object>> prescriptions = prescriptionStorage.getOrDefault(userId, new ArrayList<>());
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /*
     * GET PRESCRIPTIONS BY USER ID (ADMIN)
     * Endpoint: GET /prescriptions/user/{userId}
     * Access: Protected (admin only)
     * 
     * Admin can view any user's prescriptions
     * 
     * Response: List of prescriptions for specified user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getPrescriptionsByUserId(
            @PathVariable Long userId) {
        try {
            List<Map<String, Object>> prescriptions = prescriptionStorage.getOrDefault(userId, new ArrayList<>());
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /*
     * UPLOAD PRESCRIPTION FILE
     * Endpoint: POST /prescriptions
     * Access: Protected (requires JWT token)
     * 
     * Uploads a prescription file (PDF, image, etc.)
     * 
     * Request: multipart/form-data with "file" parameter
     * Max file size: 5MB
     * 
     * Response: {
     *   "id": "uuid",
     *   "message": "File uploaded successfully",
     *   "fileName": "prescription.pdf",
     *   "userId": 1,
     *   "uploadedDate": "2024-01-01T10:00:00"
     * }
     */
    @PostMapping
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            String contentType = (file != null) ? file.getContentType() : "<no-file>";

            // Validate file is not empty
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            // Generate unique ID for prescription
            String prescriptionId = UUID.randomUUID().toString();
            
            // Store file bytes in memory
            byte[] fileBytes = file.getBytes();
            fileStorage.put(prescriptionId, fileBytes);

            // Create prescription metadata
            Map<String, Object> prescription = new HashMap<>();
            prescription.put("id", prescriptionId);
            prescription.put("fileName", file.getOriginalFilename());
            prescription.put("fileSize", file.getSize());
            prescription.put("uploadedDate", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            prescription.put("userId", userId);

            // Add to user's prescription list
            prescriptionStorage.computeIfAbsent(userId, k -> new ArrayList<>())
                    .add(prescription);


            return ResponseEntity.ok(Map.of(
                    "id", prescriptionId,
                    "message", "File uploaded successfully",
                    "fileName", file.getOriginalFilename(),
                    "userId", userId,
                    "uploadedDate", prescription.get("uploadedDate")
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*
     * DOWNLOAD PRESCRIPTION FILE
     * Endpoint: GET /prescriptions/{id}/download
     * Access: Protected (requires JWT token)
     * 
     * Downloads a prescription file by ID
     * 
     * Response: File bytes with appropriate headers for download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadPrescription(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            // Get file bytes from storage
            byte[] fileBytes = fileStorage.get(id);
            if (fileBytes == null) {
                return ResponseEntity.notFound().build();
            }

            // Find original filename
            String fileName = "prescription.pdf";
            for (List<Map<String, Object>> userPrescriptions : prescriptionStorage.values()) {
                for (Map<String, Object> prescription : userPrescriptions) {
                    if (prescription.get("id").equals(id)) {
                        fileName = (String) prescription.get("fileName");
                        break;
                    }
                }
            }

            // Return file with download headers
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(fileBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
