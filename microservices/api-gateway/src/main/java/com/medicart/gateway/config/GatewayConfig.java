package com.medicart.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.WebFilter;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.Collections;

/**
 * Gateway-level CORS configuration for Spring Cloud Gateway
 * This ensures CORS headers are added to all responses, including OPTIONS preflight requests
 */
@Configuration
public class GatewayConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter corsFilter() {
        return (exchange, chain) -> {
            String origin = exchange.getRequest().getHeaders().getOrigin();
            
            // Check if origin is allowed
            if (isOriginAllowed(origin)) {
                exchange.getResponse().getHeaders().add("Access-Control-Allow-Origin", origin);
                exchange.getResponse().getHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD");
                exchange.getResponse().getHeaders().add("Access-Control-Allow-Headers", "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization");
                exchange.getResponse().getHeaders().add("Access-Control-Allow-Credentials", "true");
                exchange.getResponse().getHeaders().add("Access-Control-Max-Age", "3600");
                
                // Handle preflight (OPTIONS) requests
                if (exchange.getRequest().getMethod().toString().equals("OPTIONS")) {
                    exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.OK);
                    return exchange.getResponse().setComplete();
                }
            }
            
            return chain.filter(exchange);
        };
    }

    private boolean isOriginAllowed(String origin) {
        if (origin == null) {
            return false;
        }
        
        return Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174"
        ).contains(origin);
    }
}
