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
/**
 * Provides minimal OpenAPI metadata for the auth-service.
 *
 * This class only holds the {@link OpenAPIDefinition} annotation so that
 * the generated OpenAPI document includes a human-friendly title and
 * description that the API Gateway aggregator can use when merging
 * multiple services' docs.
 */
public class OpenApiConfig {
}
