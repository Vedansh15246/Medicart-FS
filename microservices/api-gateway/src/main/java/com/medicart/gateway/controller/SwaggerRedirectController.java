package com.medicart.gateway.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple controller to redirect common swagger-ui index paths to the actual swagger-ui.html
 * Some clients/bundles use /swagger-ui/index.html; the starter exposes /swagger-ui.html by default
 */
@RestController
@RequestMapping
public class SwaggerRedirectController {

    @GetMapping({"/swagger-ui/index.html", "/swagger-ui/"})
    public ResponseEntity<Void> redirectToSwaggerUi() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.LOCATION, "/swagger-ui.html");
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
