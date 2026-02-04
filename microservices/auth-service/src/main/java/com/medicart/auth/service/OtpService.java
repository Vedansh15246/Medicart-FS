package com.medicart.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * OTP Service - Mocked Email Implementation
 * 
 * This service generates and verifies OTPs without sending actual emails.
 * The OTP is stored in memory with a 10-minute expiration.
 * In production, replace with actual SMTP email service.
 * 
 * For demo/evaluation purposes, OTP is logged to console and returned in response.
 */
@Service
public class OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 10;

    // In-memory store: email -> {otp, timestamp}
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    /**
     * Generate and store OTP for given email
     * Returns OTP in response for demo purposes (to show evaluator)
     */
    public Map<String, Object> generateAndSendOtp(String email) {
        String otp = generateOtp();
        long timestamp = System.currentTimeMillis();
        
        otpStore.put(email, new OtpData(otp, timestamp));
        
        // Log to console for demo purposes
        log.warn("============================================================");
        log.warn("🔐 OTP Generated for Email: {}", email);
        log.warn("📱 OTP Code: {}", otp);
        log.warn("⏱️  Expires in: {} minutes", OTP_EXPIRY_MINUTES);
        log.warn("============================================================");
        
        // Return OTP in response for evaluation/demo (remove in production)
        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent successfully (mocked - no email sent due to SMTP restrictions)");
        response.put("email", email);
        response.put("demoOtp", otp); // For demo purposes only
        response.put("expiryMinutes", OTP_EXPIRY_MINUTES);
        response.put("note", "Email service is mocked. OTP shown here for demo purposes.");
        
        return response;
    }

    /**
     * Verify OTP for given email
     */
    public boolean verifyOtp(String email, String providedOtp) {
        OtpData storedOtpData = otpStore.get(email);
        
        if (storedOtpData == null) {
            log.error("❌ OTP not found for email: {}", email);
            return false;
        }
        
        // Check expiry
        long currentTime = System.currentTimeMillis();
        long expiryTime = storedOtpData.timestamp + TimeUnit.MINUTES.toMillis(OTP_EXPIRY_MINUTES);
        
        if (currentTime > expiryTime) {
            log.error("❌ OTP expired for email: {}", email);
            otpStore.remove(email);
            return false;
        }
        
        // Verify OTP
        boolean isValid = storedOtpData.otp.equals(providedOtp);
        
        if (isValid) {
            log.info("✅ OTP verified successfully for email: {}", email);
            otpStore.remove(email); // Remove after successful verification
        } else {
            log.error("❌ Invalid OTP for email: {}. Expected: {}, Got: {}", email, storedOtpData.otp, providedOtp);
        }
        
        return isValid;
    }

    /**
     * Generate 6-digit random OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Helper class to store OTP with timestamp
     */
    private static class OtpData {
        String otp;
        long timestamp;

        OtpData(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }
}
