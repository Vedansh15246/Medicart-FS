package com.medicart.analytics.client;

import com.medicart.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthClient {
    
    @GetMapping("/auth/users/{userId}")
    UserDTO getUserById(@PathVariable Long userId);
    
    @GetMapping("/auth/analytics/user-counts")
    Map<String, Long> getUserCounts();
}
