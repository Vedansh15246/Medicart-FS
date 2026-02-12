package com.medicart.gateway.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SwaggerController: Redirect root and /swagger-ui to Swagger UI endpoint
 * 
 * This controller handles the routing because Spring Cloud Gateway (reactive)
 * may not automatically serve Swagger UI static resources the same way a
 * servlet-based Spring Boot app does.
 */
@Controller
public class SwaggerController {

    /**
     * Redirect root to Swagger UI for convenience
     */
    @GetMapping("/")
    public String root() {
        return "redirect:/webjars/swagger-ui/index.html";
    }

    /**
     * Alternative: direct access to API docs
     */
    @GetMapping("/api-docs")
    public String apiDocs() {
        return "redirect:/v3/api-docs";
    }
}
