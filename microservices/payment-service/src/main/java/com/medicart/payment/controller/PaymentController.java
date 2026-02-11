package com.medicart.payment.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.payment.entity.Payment;
import com.medicart.payment.entity.Transaction;
import com.medicart.payment.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) String paymentMethod,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        try {
            // Extract from query params or request body
            Long finalUserId = userId;
            Long finalOrderId = orderId;
            BigDecimal finalAmount = amount;
            String finalPaymentMethod = paymentMethod;

            if (requestBody != null) {
                if (requestBody.containsKey("userId")) {
                    finalUserId = Long.parseLong(requestBody.get("userId").toString());
                }
                if (requestBody.containsKey("orderId")) {
                    finalOrderId = Long.parseLong(requestBody.get("orderId").toString());
                }
                if (requestBody.containsKey("amount")) {
                    finalAmount = new BigDecimal(requestBody.get("amount").toString());
                }
                if (requestBody.containsKey("paymentMethod")) {
                    finalPaymentMethod = requestBody.get("paymentMethod").toString();
                }
            }

            if (finalUserId == null) {
                finalUserId = 0L; // Default or extract from JWT token
            }
            if (finalAmount == null || finalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Invalid amount: " + finalAmount);
            }
            if (finalPaymentMethod == null || finalPaymentMethod.isEmpty()) {
                throw new IllegalArgumentException("Payment method is required");
            }

            Payment payment = paymentService.processPayment(finalOrderId, finalUserId, finalAmount, finalPaymentMethod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", payment.getId());
            response.put("status", payment.getPaymentStatus());
            response.put("amount", payment.getAmount());
            response.put("transactionId", payment.getTransactionId());
            response.put("message", "Payment processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // ✅ Handle duplicate constraint error gracefully
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Payment processing failed";
            
            if (errorMsg.contains("Duplicate entry") || errorMsg.contains("unique_order_payment")) {
                // This is a duplicate payment attempt for same order
                // Return a friendly error message
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Payment already exists for this order. Please wait or refresh and try again.");
                error.put("errorCode", "DUPLICATE_PAYMENT");
                error.put("status", "failed");
                return ResponseEntity.status(409).body(error);  // 409 Conflict
            }
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", errorMsg);
            error.put("status", "failed");
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentStatus(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.getPaymentStatus(paymentId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @GetMapping("/user/history")
    public ResponseEntity<List<Payment>> getUserPaymentHistory(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            List<Payment> payments = paymentService.getUserPayments(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<Map<String, Object>> refundPayment(@PathVariable Long paymentId) {
        try {
            Payment refundedPayment = paymentService.refundPayment(paymentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", refundedPayment.getId());
            response.put("status", refundedPayment.getPaymentStatus());
            response.put("amount", refundedPayment.getAmount());
            response.put("message", "Payment refunded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/{paymentId}/transactions")
    public ResponseEntity<List<Transaction>> getPaymentTransactions(@PathVariable Long paymentId) {
        try {
            List<Transaction> transactions = paymentService.getPaymentTransactions(paymentId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Payment Service");
        return ResponseEntity.ok(response);
    }
}
