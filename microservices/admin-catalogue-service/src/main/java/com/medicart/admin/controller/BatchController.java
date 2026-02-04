package com.medicart.admin.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.admin.service.BatchService;
import com.medicart.common.dto.BatchDTO;

@RestController
@RequestMapping("/batches")
public class BatchController {

    private static final Logger log = LoggerFactory.getLogger(BatchController.class);
    private final BatchService service;

    public BatchController(BatchService service) {
        this.service = service;
    }

    private void logSecurityContext(String methodName) {
        log.debug("════════════════════════════════════════════════════════════════");
        log.debug("🎯 [BatchController.{}] SECURITY CONTEXT CHECK", methodName);
        
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
    public List<BatchDTO> getAllBatches() {
        log.debug("🔷 [GET /batches] REQUEST RECEIVED");
        logSecurityContext("getAllBatches");
        
        List<BatchDTO> batches = service.getAllBatches();
        log.debug("✅ [GET /batches] RESPONSE SENT: {} batches", batches.size());
        return batches;
    }

    @GetMapping("/{medicineId}/available")
    public List<BatchDTO> getAvailableBatches(@PathVariable Long medicineId) {
        log.debug("🔷 [GET /batches/{}/available] REQUEST RECEIVED", medicineId);
        logSecurityContext("getAvailableBatches");
        
        List<BatchDTO> batches = service.getAvailableBatches(medicineId);
        log.debug("✅ [GET /batches/{}/available] RESPONSE SENT: {} batches (FIFO sorted by expiry)", medicineId, batches.size());
        return batches;
    }

    @PostMapping
    public BatchDTO createBatch(@RequestBody BatchDTO dto) {
        log.debug("🔶 [POST /batches] REQUEST RECEIVED");
        log.debug("   Body: {}", dto);
        logSecurityContext("createBatch");
        
        BatchDTO created = service.createBatch(dto);
        log.debug("✅ [POST /batches] RESPONSE SENT: {}", created.getId());
        return created;
    }

    @PutMapping("/{id}")
    public BatchDTO updateBatch(@PathVariable Long id,
                                @RequestBody BatchDTO dto) {
        log.debug("🔶 [PUT /batches/{}] REQUEST RECEIVED", id);
        log.debug("   Body: {}", dto);
        logSecurityContext("updateBatch");
        
        BatchDTO updated = service.updateBatch(id, dto);
        log.debug("✅ [PUT /batches/{}] RESPONSE SENT", id);
        return updated;
    }

    @DeleteMapping("/{id}")
    public void deleteBatch(@PathVariable Long id) {
        log.debug("🔴 [DELETE /batches/{}] REQUEST RECEIVED", id);
        logSecurityContext("deleteBatch");
        
        service.deleteBatch(id);
        log.debug("✅ [DELETE /batches/{}] RESPONSE SENT", id);
    }

    @PutMapping("/{batchId}/reduce-quantity")
    public void reduceBatchQuantity(@PathVariable Long batchId,
                                   @RequestParam Integer quantity) {
        log.debug("🔶 [PUT /batches/{}/reduce-quantity] REQUEST RECEIVED - quantity: {}", batchId, quantity);
        logSecurityContext("reduceBatchQuantity");
        
        service.reduceBatchQuantity(batchId, quantity);
    }

    /**
     * Exception handler for database constraint violations
     * Catches duplicate batch_number errors and returns proper error response
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("❌ [BatchController] DATABASE CONSTRAINT VIOLATION");
        log.error("   Error: {}", ex.getMessage());
        
        String errorMessage = "Database constraint violation";
        
        // Check if it's a duplicate batch_number error
        if (ex.getMessage() != null && ex.getMessage().contains("Duplicate entry")) {
            if (ex.getMessage().contains("UK7m5b87j08fvngd8ki2dwl93g6")) {
                errorMessage = "❌ BATCH NUMBER ALREADY EXISTS for this medicine! " +
                        "Cannot create duplicate batch numbers for the same medicine. " +
                        "Please use a different batch number.";
            } else {
                errorMessage = "❌ DUPLICATE ENTRY: " + ex.getMessage();
            }
        }
        
        log.error("   Returning: 400 Bad Request with message: {}", errorMessage);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                    400,
                    errorMessage,
                    "Please check your batch data and try again"
                ));
    }

    /**
     * Generic exception handler for other runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("❌ [BatchController] RUNTIME EXCEPTION", ex);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                    400,
                    ex.getMessage(),
                    "Request processing failed"
                ));
    }

    /**
     * Error response DTO
     */
    public static class ErrorResponse {
        public int status;
        public String message;
        public String details;

        public ErrorResponse(int status, String message, String details) {
            this.status = status;
            this.message = message;
            this.details = details;
        }

        public int getStatus() { return status; }
        public String getMessage() { return message; }
        public String getDetails() { return details; }
    }
}
