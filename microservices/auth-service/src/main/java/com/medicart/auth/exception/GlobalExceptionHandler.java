/*
 * ========================================
 * GLOBAL EXCEPTION HANDLER
 * ========================================
 * This class handles errors that occur in the application.
 * 
 * WHAT IS AN EXCEPTION HANDLER?
 * When something goes wrong (error), instead of showing ugly error messages,
 * this class catches the error and returns a nice, user-friendly response.
 * 
 * WHAT IT HANDLES:
 * - File upload size exceeded (file too large)
 * - Multipart request errors (invalid file upload)
 * 
 * HOW IT WORKS:
 * 1. Error occurs in controller
 * 2. Spring catches the exception
 * 3. This handler catches it and formats response
 * 4. Returns clean JSON error message to client
 * 
 * EXAMPLE:
 * User uploads 10MB file (limit is 5MB)
 * → MaxUploadSizeExceededException thrown
 * → This handler catches it
 * → Returns: {"error": "File size exceeds maximum allowed (5MB)"}
 * 
 * ANNOTATIONS EXPLAINED:
 * @RestControllerAdvice - Applies to all controllers, returns JSON responses
 * @ExceptionHandler - Specifies which exception this method handles
 */

package com.medicart.auth.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * HANDLE FILE SIZE EXCEEDED
     * Catches errors when uploaded file is too large
     * 
     * WHEN IT TRIGGERS:
     * - User uploads file larger than 5MB
     * - Configured in application.properties:
     *   spring.servlet.multipart.max-file-size=6MB
     * 
     * RETURNS:
     * - HTTP 413 (Payload Too Large)
     * - JSON: {"error": "File size exceeds maximum allowed (5MB)"}
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("error", "File size exceeds maximum allowed (5MB)"));
    }

    /**
     * HANDLE MULTIPART ERRORS
     * Catches errors in file upload processing
     * 
     * WHEN IT TRIGGERS:
     * - Invalid multipart request format
     * - Missing required file parameter
     * - Corrupted file upload
     * 
     * RETURNS:
     * - HTTP 400 (Bad Request)
     * - JSON: {"error": "Invalid multipart request"}
     */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipart(MultipartException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid multipart request"));
    }
}
