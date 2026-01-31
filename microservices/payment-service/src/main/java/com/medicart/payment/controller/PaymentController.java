package com.medicart.payment.controller;

import com.medicart.payment.entity.Payment;
import com.medicart.payment.entity.Transaction;
import com.medicart.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long orderId,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {
        try {
            Payment payment = paymentService.processPayment(orderId, userId, amount, paymentMethod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", payment.getId());
            response.put("status", payment.getPaymentStatus());
            response.put("amount", payment.getAmount());
            response.put("transactionId", payment.getTransactionId());
            response.put("message", "Payment processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
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
