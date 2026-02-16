package com.medicart.analytics.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "Medicart Analytics API",
                version = "v1",
                description = "APIs for analytics and reporting"
        )
)
@Configuration
public class OpenApiConfig {
}
