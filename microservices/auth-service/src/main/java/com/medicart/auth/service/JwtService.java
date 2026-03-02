/*
 * ========================================
 * JWT SERVICE - TOKEN MANAGEMENT
 * ========================================
 * This class handles JWT (JSON Web Token) operations.
 * 
 * WHAT IS JWT?
 * JWT is like a digital ID card that proves who you are.
 * When you login, you get a JWT token. You send this token with every request
 * to prove you're logged in. The server verifies the token without checking the database.
 * 
 * WHAT THIS SERVICE DOES:
 * - Generate JWT tokens when users login
 * - Extract information from tokens (email, role, etc.)
 * - Validate tokens (check if they're real and not expired)
 * 
 * HOW JWT WORKS:
 * 1. User logs in with email/password
 * 2. Server creates a JWT token with user info
 * 3. Server signs the token with a secret key
 * 4. User stores token and sends it with every request
 * 5. Server verifies token signature to ensure it's valid
 * 
 * ANNOTATIONS EXPLAINED:
 * @Service - This is a business logic component
 * @Value - Injects values from application.properties file
 */

package com.medicart.auth.service;

import com.medicart.auth.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    // Secret key from application.properties (used to sign tokens)
    // IMPORTANT: This must be at least 256 bits (32 characters) long
    @Value("${jwt.secret:your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart}")
    private String secretKey;

    // Token expiration time in milliseconds (default: 1 hour)
    @Value("${jwt.expiration:3600000}")
    private long expiration;

    /**
     * GET SIGNING KEY
     * Converts the secret string into a cryptographic key
     * This key is used to sign and verify JWT tokens
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * GENERATE JWT TOKEN
     * Creates a new JWT token for a user
     * 
     * TOKEN CONTAINS:
     * - User's email (subject)
     * - User's role (for authorization)
     * - User's full name
     * - User's ID
     * - Issue time (when token was created)
     * - Expiration time (when token becomes invalid)
     * 
     * STEPS:
     * 1. Create claims (data to store in token)
     * 2. Set subject (user's email)
     * 3. Set issue and expiration times
     * 4. Sign token with secret key
     * 5. Return token as string
     */
    public String generateToken(User user) {
        // Claims = data stored in the token
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "ROLE_" + user.getRole().getName().replace("ROLE_", ""));
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName());
        
        // Include user ID so other services can identify the user
        if (user.getId() != null) {
            claims.put("userId", user.getId());
        }

        // Build and return the JWT token
        return Jwts.builder() // Create a new token
                .claims(claims)                                              // Add user data
                .subject(user.getEmail())                                    // Set subject (email)
                .issuedAt(new Date())                                        // When token was created
                .expiration(new Date(System.currentTimeMillis() + expiration)) // When token expires
                .signWith(getSigningKey())                                   // Sign with secret key
                .compact();                                                  // Convert to string
    }

    /**
     * EXTRACT EMAIL FROM TOKEN
     * Reads the token and returns the user's email
     * 
     * HOW IT WORKS:
     * 1. Parse the token
     * 2. Verify signature with secret key
     * 3. Extract subject (email)
     * 4. Return email
     */
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // Verify signature
                .build() // Build the parser
                .parseSignedClaims(token)     // Parse token
                .getPayload()                 // Get data
                .getSubject();                // Get subject (email)
    }

    /**
     * VALIDATE TOKEN
     * Checks if a token is valid
     * 
     * TOKEN IS VALID IF:
     * - Signature is correct (signed with our secret key)
     * - Token is not expired
     * - Token format is correct
     * 
     * RETURNS:
     * - true if token is valid
     * - false if token is invalid or expired
     */
    public boolean isTokenValid(String token) {
        try {
            // Try to parse and verify the token
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;  // Token is valid
        } catch (Exception e) {
            return false; // Token is invalid
        }
    }
}
