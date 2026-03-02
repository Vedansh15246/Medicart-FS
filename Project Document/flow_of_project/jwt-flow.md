# JWT (JSON Web Token) in Medicart-FS: Complete Beginner-Friendly Guide

This document explains what JWT is, why it is used, and how it works in the Medicart-FS project. It covers the flow from token generation to validation, with code snippets and clear explanations for each step.

---

## 1. What is JWT?
- **JWT (JSON Web Token)** is a compact, URL-safe token format used to securely transmit information between parties as a JSON object.
- It is commonly used for authentication and authorization in web applications.
- A JWT consists of three parts: Header, Payload, and Signature.

**Example JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJST0xFX1VTRVIiLCJleHAiOjE2ODg4ODg4ODgsImlhdCI6MTY4ODg4ODg4OH0.abc123signature
```

---

## 2. Why Use JWT?
- **Stateless Authentication:** No need to store session data on the server. The token itself contains all necessary info.
- **Security:** The token is signed, so it cannot be tampered with.
- **Scalability:** Works well with microservices and distributed systems.
- **Easy to Use:** Can be sent in HTTP headers for every request.

---

## 3. JWT Structure
- **Header:** Specifies the signing algorithm (e.g., HS256).
- **Payload:** Contains claims (user info, roles, etc.).
- **Signature:** Ensures the token is valid and untampered.

---

## 4. How JWT is Generated (Backend)

**File:** `microservices/auth-service/src/main/java/com/medicart/auth/service/JwtService.java`
```java
public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .claim("userId", user.getId())
        .claim("role", user.getRole().getName())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(secretKey, SignatureAlgorithm.HS256)
        .compact();
}
```
**Explanation:**
- `setSubject`: Sets the main subject (usually the user's email).
- `claim`: Adds custom data (userId, role) to the payload.
- `setIssuedAt` and `setExpiration`: Set the token's validity period.
- `signWith`: Signs the token with a secret key and algorithm.
- `compact()`: Builds the final JWT string.

---

## 5. How JWT is Used (Frontend & Backend)
- After login or registration, the backend returns a JWT to the frontend.
- The frontend stores the JWT (e.g., in localStorage).
- For every protected API request, the frontend sends the JWT in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

- The backend (or API Gateway) validates the JWT on each request.
- If valid, the request is allowed; if invalid or expired, access is denied.

---

## 6. How JWT is Validated (Backend)

**File:** `microservices/auth-service/src/main/java/com/medicart/auth/service/JwtService.java`
```java
public Claims extractAllClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
}

public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
}
```
**Explanation:**
- `extractAllClaims`: Parses the JWT and extracts all claims (payload data).
- `isTokenValid`: Checks if the token's username matches and if it is not expired.

---

## 7. Sequence Diagram: JWT Usage
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIGateway
    participant AuthService

    User->>Frontend: Login/Register
    Frontend->>APIGateway: POST /auth/login (credentials)
    APIGateway->>AuthService: Forward request
    AuthService-->>APIGateway: Response with JWT
    APIGateway-->>Frontend: Response with JWT
    Frontend-->>User: Store JWT
    Frontend->>APIGateway: Request protected resource (with JWT)
    APIGateway->>AuthService: Validate JWT
    AuthService-->>APIGateway: Allow/Deny
    APIGateway-->>Frontend: Response
```

---

This document provides a complete, beginner-friendly explanation of JWT in Medicart-FS, with code and file paths for each step.
