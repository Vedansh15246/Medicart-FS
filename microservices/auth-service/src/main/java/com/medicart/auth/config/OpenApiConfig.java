/*
 * ========================================
 * OPENAPI CONFIGURATION (SWAGGER)
 * ========================================
 * This class configures API documentation for the auth service.
 * 
 * WHAT IS OPENAPI/SWAGGER?
 * OpenAPI (formerly Swagger) is a standard for documenting REST APIs.
 * It creates:
 * - Interactive API documentation (Swagger UI)
 * - JSON/YAML files describing all endpoints
 * - Ability to test APIs directly from browser
 * 
 * WHERE TO ACCESS:
 * - Swagger UI: http://localhost:8081/swagger-ui.html
 * - API Docs JSON: http://localhost:8081/v3/api-docs
 * 
 * WHY IS THIS USEFUL?
 * - Developers can see all available endpoints
 * - Can test APIs without writing code
 * - API Gateway can aggregate docs from all services
 * - Frontend developers know what data to send/receive
 * 
 * ANNOTATIONS EXPLAINED:
 * @OpenAPIDefinition - Defines metadata for the API documentation
 * @Configuration - This is a configuration class
 */

package com.medicart.auth.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@OpenAPIDefinition(
        info = @Info(
                title = "Medicart Auth Service API",
                version = "v1",
                description = "APIs for authentication, user management, OTP, and prescriptions"
        )
)
@Configuration
public class OpenApiConfig {
    // This class only needs the @OpenAPIDefinition annotation
    // Spring automatically generates the documentation based on your controllers
}
