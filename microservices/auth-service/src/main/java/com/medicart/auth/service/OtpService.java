/*
 * ========================================
 * OTP SERVICE - ONE-TIME PASSWORD
 * ========================================
 * This service handles OTP (One-Time Password) generation and verification.
 * 
 * WHAT IS OTP?
 * OTP is a 6-digit code sent to your email for verification.
 * It's used for:
 * - Email verification during registration
 * - Password reset verification
 * - Two-factor authentication
 * 
 * HOW IT WORKS:
 * 1. User requests OTP (e.g., forgot password)
 * 2. System generates random 6-digit code
 * 3. System stores code with timestamp
 * 4. System "sends" code to user's email (mocked for demo)
 * 5. User enters code
 * 6. System verifies code matches and isn't expired
 * 
 * IMPORTANT NOTE:
 * This is a DEMO implementation. In production, you would:
 * - Actually send emails using SMTP service
 * - Store OTPs in database (not memory)
 * - Add rate limiting to prevent abuse
 * 
 * CURRENT BEHAVIOR:
 * - OTP is logged to console (for testing)
 * - OTP is returned in API response (for demo)
 * - OTP expires after 10 minutes
 * - OTP is stored in memory (lost on restart)
 */

package com.medicart.auth.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {
    
    // OTP configuration
    private static final int OTP_LENGTH = 6;              // 6-digit code
    private static final long OTP_EXPIRY_MINUTES = 10;    // Expires in 10 minutes

    // In-memory storage: email -> OtpData (code + timestamp)
    // ConcurrentHashMap = thread-safe map (multiple users can use it simultaneously)
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    /**
     * GENERATE AND SEND OTP
     * Creates a 6-digit OTP and "sends" it to the user
     * 
     * STEPS:
     * 1. Generate random 6-digit code
     * 2. Store code with current timestamp
     * 3. Log code to console (for demo)
     * 4. Return code in response (for demo)
     * 
     * IN PRODUCTION:
     * - Would send actual email using SMTP
     * - Would NOT return OTP in response
     * - Would store in database
     * 
     * RETURNS:
     * Map containing:
     * - message: Success message
     * - email: User's email
     * - demoOtp: The OTP code (for demo only!)
     * - expiryMinutes: How long OTP is valid
     */
    public Map<String, Object> generateAndSendOtp(String email) {
        // Generate random 6-digit OTP
        String otp = generateOtp();
        long timestamp = System.currentTimeMillis();
        
        // Store OTP with timestamp
        otpStore.put(email, new OtpData(otp, timestamp));
        
        
        // Return OTP in response for demo (REMOVE IN PRODUCTION!)
        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent successfully (mocked - no email sent due to SMTP restrictions)");
        response.put("email", email);
        response.put("demoOtp", otp); // For demo purposes only!
        response.put("expiryMinutes", OTP_EXPIRY_MINUTES);
        response.put("note", "Email service is mocked. OTP shown here for demo purposes.");
        
        return response;
    }

    /**
     * VERIFY OTP
     * Checks if the provided OTP is correct and not expired
     * 
     * STEPS:
     * 1. Find stored OTP for this email
     * 2. Check if OTP exists
     * 3. Check if OTP is expired
     * 4. Check if OTP matches
     * 5. Remove OTP after successful verification (one-time use!)
     * 
     * RETURNS:
     * - true if OTP is valid
     * - false if OTP is invalid, expired, or not found
     */
    public boolean verifyOtp(String email, String providedOtp) {
        // Get stored OTP data for this email
        OtpData storedOtpData = otpStore.get(email);
        
        // Check if OTP exists
        if (storedOtpData == null) {
            return false;
        }
        
        // Check if OTP is expired
        long currentTime = System.currentTimeMillis();
        long expiryTime = storedOtpData.timestamp + TimeUnit.MINUTES.toMillis(OTP_EXPIRY_MINUTES);
        
        if (currentTime > expiryTime) {
            otpStore.remove(email); // Remove expired OTP
            return false;
        }
        
        // Check if OTP matches
        boolean isValid = storedOtpData.otp.equals(providedOtp);
        
        if (isValid) {
            otpStore.remove(email); // Remove OTP after successful verification (one-time use!)
        }
        
        return isValid;
    }

    /**
     * GENERATE 6-DIGIT OTP
     * Creates a random 6-digit number
     * 
     * HOW IT WORKS:
     * - Random number between 100000 and 999999
     * - Ensures it's always 6 digits
     * 
     * EXAMPLE: 123456, 789012, 456789
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Random number from 100000 to 999999
        return String.valueOf(otp);
    }

    /**
     * OTP DATA CLASS
     * Stores OTP code with its creation timestamp
     * 
     * WHY STORE TIMESTAMP?
     * To check if OTP is expired (older than 10 minutes)
     */
    private static class OtpData {
        String otp;        // The 6-digit code
        long timestamp;    // When it was created (milliseconds)

        OtpData(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }
}
