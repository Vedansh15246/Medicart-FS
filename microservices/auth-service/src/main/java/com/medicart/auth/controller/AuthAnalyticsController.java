/*
 * ========================================
 * AUTH ANALYTICS CONTROLLER - USER STATISTICS
 * ========================================
 * This controller provides analytics and statistics about users.
 * 
 * BASE URL: /auth/analytics
 * 
 * WHAT THIS CONTROLLER DOES:
 * ✅ Get user registration statistics
 * ✅ Count users by time period (today, week, month, year)
 * 
 * USE CASE:
 * Admin dashboard showing user growth metrics
 */

package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/analytics")
public class AuthAnalyticsController {

    private final AuthService authService;

    public AuthAnalyticsController(AuthService authService) {
        this.authService = authService;
    }

    /*
     * GET USER COUNTS
     * Endpoint: GET /auth/analytics/user-counts
     * Access: Public (but typically used by admin)
     * 
     * Returns user registration statistics by time period
     * 
     * Response: {
     *   "totalUsers": 100,
     *   "usersToday": 5,
     *   "usersThisWeek": 20,
     *   "usersThisMonth": 45,
     *   "usersThisYear": 100
     * }
     * 
     * USE CASE:
     * Admin dashboard showing:
     * - Total registered users
     * - New users today
     * - New users this week
     * - New users this month
     * - New users this year
     */
    @GetMapping("/user-counts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        try {
            Map<String, Long> counts = authService.getUserCounts();
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            // Error handling: log removed for simplicity
            return ResponseEntity.internalServerError().build();
        }
    }
}
