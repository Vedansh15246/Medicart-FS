package com.medicart.cartorders.client;

import com.medicart.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service")
public interface AuthClient {
    
    @GetMapping("/auth/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long userId);
    
    @GetMapping("/auth/validate")
    String validateToken();
}
