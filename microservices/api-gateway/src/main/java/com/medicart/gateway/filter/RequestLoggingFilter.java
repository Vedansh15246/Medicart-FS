package com.medicart.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RequestLoggingFilter implements GlobalFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String method = exchange.getRequest().getMethod().toString();
        String path = exchange.getRequest().getPath().toString();
        String query = exchange.getRequest().getQueryParams().toString();
        
        logger.info("📍 API Gateway receiving request:");
        logger.info("   Method: {}", method);
        logger.info("   Path: {}", path);
        logger.info("   Query Params: {}", query);
        logger.info("   Headers: {}", exchange.getRequest().getHeaders().keySet());
        
        return chain.filter(exchange);
    }
}
