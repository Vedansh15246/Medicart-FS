package com.medicart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String token;
    private String tokenType;
    private Long expiresIn;
    private java.util.List<String> roles;
}
