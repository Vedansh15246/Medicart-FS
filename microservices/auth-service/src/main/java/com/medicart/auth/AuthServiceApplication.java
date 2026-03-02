/*
 * ========================================
 * AUTH SERVICE - MAIN APPLICATION CLASS
 * ========================================
 * This is the starting point of the Authentication Service.
 * 
 * WHAT THIS SERVICE DOES:
 * - Handles user registration and login
 * - Manages JWT tokens for authentication
 * - Stores user information in database
 * - Handles password reset functionality
 * - Manages prescription uploads
 * 
 * ANNOTATIONS EXPLAINED:
 * @SpringBootApplication - Tells Spring this is the main application class
 * @EnableDiscoveryClient - Registers this service with Eureka (service discovery)
 *                          so other services can find and communicate with it
 */

package com.medicart.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {
    // Main method - program starts here
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
