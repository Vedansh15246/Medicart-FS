package com.medicart.payment.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicart.payment.client.CartOrdersClient;
import com.medicart.payment.entity.Payment;
import com.medicart.payment.entity.Transaction;
import com.medicart.payment.repository.PaymentRepository;
import com.medicart.payment.repository.TransactionRepository;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CartOrdersClient cartOrdersClient;

    @Transactional
    public Payment processPayment(Long orderId, Long userId, BigDecimal amount, String paymentMethod) {
        try {
            // Check if payment already exists for this order
            Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
            
            Payment payment;
            
            if (existingPayment.isPresent()) {
                payment = existingPayment.get();
                
                // If payment already succeeded, return it
                if (payment.getPaymentStatus() == Payment.PaymentStatus.SUCCESS) {
                    return payment;
                }
                
                // ✅ FIX: If payment exists but failed/pending, UPDATE it instead of creating new one
                // This prevents duplicate key constraint violation
                payment.setPaymentStatus(Payment.PaymentStatus.PROCESSING);
                payment.setPaymentMethod(paymentMethod);
                payment.setAmount(amount);
                payment.setTransactionId(UUID.randomUUID().toString());
                payment.setPaymentDate(LocalDateTime.now());
            } else {
                // Create new payment record
                payment = Payment.builder()
                        .orderId(orderId)
                        .userId(userId)
                        .amount(amount)
                        .paymentMethod(paymentMethod)
                        .paymentStatus(Payment.PaymentStatus.PROCESSING)
                        .transactionId(UUID.randomUUID().toString())
                        .paymentDate(LocalDateTime.now())
                        .build();
            }

            payment = paymentRepository.save(payment);

            // Simulate payment processing (in real scenario, call payment gateway)
            simulatePaymentGateway(payment);

            // Create transaction record
            Transaction transaction = Transaction.builder()
                    .paymentId(payment.getId())
                    .transactionType(Transaction.TransactionType.PAYMENT)
                    .amount(amount)
                    .transactionId(UUID.randomUUID().toString())
                    .status(Transaction.TransactionStatus.SUCCESS)
                    .description("Payment processed for order " + orderId)
                    .build();

            transactionRepository.save(transaction);

            // Update payment status
            payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
            payment = paymentRepository.save(payment);

            try {
                cartOrdersClient.finalizePayment(orderId, userId);
            } catch (Exception e) {
                log.warn("Failed to finalize payment for order {}: {}", orderId, e.getMessage());
            }

            // Clear cart after successful payment
            try {
                cartOrdersClient.clearCart(userId);
            } catch (Exception e) {
                log.warn("Failed to clear cart for user {}: {}", userId, e.getMessage());
            }

            return payment;
        } catch (Exception e) {
            return handlePaymentFailure(orderId, userId, amount, paymentMethod, e);
        }
    }

    @Transactional
    public Payment refundPayment(Long paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }

        Payment payment = paymentOpt.get();

        // Create refund transaction
        Transaction transaction = Transaction.builder()
                .paymentId(paymentId)
                .transactionType(Transaction.TransactionType.REFUND)
                .amount(payment.getAmount())
                .transactionId(UUID.randomUUID().toString())
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Refund for payment " + payment.getId())
                .build();

        transactionRepository.save(transaction);

        // Update payment status
        payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public Payment getPaymentStatus(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElse(null);
    }

    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    public List<Transaction> getPaymentTransactions(Long paymentId) {
        return transactionRepository.findByPaymentId(paymentId);
    }

    private void simulatePaymentGateway(Payment payment) {
        // In production, this would call actual payment gateway (Stripe, PayPal, etc.)
        // For now, simulate a successful payment with some delay
        try {
            Thread.sleep(100); // Simulate processing time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Payment processing interrupted");
        }
    }

    private Payment handlePaymentFailure(Long orderId, Long userId, BigDecimal amount, 
                                       String paymentMethod, Exception e) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .paymentStatus(Payment.PaymentStatus.FAILED)
                .transactionId(UUID.randomUUID().toString())
                .build();

        payment = paymentRepository.save(payment);

        // Create failed transaction record
        Transaction transaction = Transaction.builder()
                .paymentId(payment.getId())
                .transactionType(Transaction.TransactionType.PAYMENT)
                .amount(amount)
                .transactionId(UUID.randomUUID().toString())
                .status(Transaction.TransactionStatus.FAILED)
                .description("Payment failed: " + e.getMessage())
                .build();

        transactionRepository.save(transaction);

        return payment;
    }
}
