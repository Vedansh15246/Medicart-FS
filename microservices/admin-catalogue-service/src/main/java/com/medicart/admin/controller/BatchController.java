package com.medicart.admin.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<BatchDTO> getAllBatches() {
        return service.getAllBatches();
    }

    @GetMapping("/{medicineId}/available")
    public List<BatchDTO> getAvailableBatches(@PathVariable Long medicineId) {
        return service.getAvailableBatches(medicineId);
    }

    @PostMapping
    public BatchDTO createBatch(@RequestBody BatchDTO dto) {
        return service.createBatch(dto);
    }

    @PutMapping("/{id}")
    public BatchDTO updateBatch(@PathVariable Long id, @RequestBody BatchDTO dto) {
        return service.updateBatch(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteBatch(@PathVariable Long id) {
        service.deleteBatch(id);
    }

    @PutMapping("/{batchId}/reduce-quantity")
    public void reduceBatchQuantity(@PathVariable Long batchId, @RequestParam Integer quantity) {
        service.reduceBatchQuantity(batchId, quantity);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database constraint violation: {}", ex.getMessage());

        String errorMessage = "Database constraint violation";
        if (ex.getMessage() != null && ex.getMessage().contains("Duplicate entry")) {
            errorMessage = ex.getMessage().contains("UK7m5b87j08fvngd8ki2dwl93g6")
                    ? "Batch number already exists for this medicine. Please use a different batch number."
                    : "Duplicate entry: " + ex.getMessage();
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, errorMessage, "Please check your batch data and try again"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Request processing failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, ex.getMessage(), "Request processing failed"));
    }

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
