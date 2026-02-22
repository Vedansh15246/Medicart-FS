# Auth Service Feign Usage

## Short answer

No — the `auth-service` in this repository does not declare or use any Feign clients. A code search of `microservices/auth-service` shows no `@FeignClient` interfaces in the source tree. The auth service also does not appear in the list of services annotated with `@EnableFeignClients`.

## What actually calls the auth service

Other microservices call `auth-service` via Feign clients. Examples in this repo:

- `microservices/analytics-service/src/main/java/com/medicart/analytics/client/AuthClient.java` — used by analytics to fetch user details and user-count analytics.  
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/AuthClient.java` — used by cart-orders to validate tokens and fetch user info.

These are *clients that call the auth service* — they are declared in the calling services (analytics, cart-orders), not inside `auth-service` itself.

## Why auth-service normally doesn't need Feign clients

- Auth services typically act as an authoritative endpoint for authentication and user management. They receive incoming requests (from API Gateway / other services) and respond. They rarely need to call other microservices in the course of handling auth requests.  
- When an auth service does need to call other services (for example, to enrich a user profile with data from another service), you can add Feign clients, but it's not required by default.

## If you want auth-service to call other services: how to add Feign

If you decide the auth-service should call other microservices (for notifications, enrichment, or auditing), here's an example of how to add a Feign client and use it.

1) Enable Feign in `AuthServiceApplication` (main class):

```java
@SpringBootApplication
@EnableFeignClients
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
```

Line-by-line:
- `@EnableFeignClients` — tells Spring Boot to scan for interfaces annotated with `@FeignClient` and create runtime proxies.

2) Create a Feign client interface under `microservices/auth-service/src/main/java/.../client/` (example: `NotificationClient`):

```java
package com.medicart.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    @PostMapping("/api/notifications")
    void sendNotification(@RequestBody NotificationDTO dto);
}
```

Line-by-line explanation:
- `@FeignClient(name = "notification-service")`: Register this interface as a Feign client that will call the logical service id `notification-service` (resolved by Eureka or the configured load balancer).  
- `@PostMapping("/api/notifications")`: The relative path to call on the remote service.  
- Method signature `void sendNotification(NotificationDTO dto)`: Feign will serialize the DTO to JSON (via Spring's Jackson) and send it in the POST body.

3) Inject and use the client in a service or controller inside auth-service:

```java
@Service
public class AuthNotificationService {
    private final NotificationClient notificationClient;

    public AuthNotificationService(NotificationClient notificationClient) {
        this.notificationClient = notificationClient;
    }

    public void notifyUserLogin(Long userId) {
        NotificationDTO dto = new NotificationDTO(userId, "LOGIN", "User logged in");
        notificationClient.sendNotification(dto);
    }
}
```

Line-by-line:
- Inject the `NotificationClient` as a normal Spring bean. Feign creates the implementation automatically.  
- Call the declared method. Exceptions thrown by Feign propagate like other runtime exceptions — handle or convert as appropriate.

## Propagating headers (Authorization / X-User-Id)

- If the auth-service receives a request containing headers that must be forwarded to downstream Feign calls (rare for auth service but possible), implement a Feign `RequestInterceptor` that reads the current `HttpServletRequest` (via `RequestContextHolder`) and adds headers to outgoing Feign requests.

Example interceptor skeleton:

```java
@Bean
public RequestInterceptor headerForwardingInterceptor() {
    return template -> {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return;
        HttpServletRequest req = attrs.getRequest();
        String token = req.getHeader("Authorization");
        if (token != null) template.header("Authorization", token);
        String userId = req.getHeader("X-User-Id");
        if (userId != null) template.header("X-User-Id", userId);
    };
}
```

Notes: using RequestContextHolder can have thread-safety implications for async calls; prefer explicit `@RequestHeader` forwarding where possible for clarity.

## What currently calls auth-service (concrete code snippets)

- `microservices/analytics-service/src/main/java/com/medicart/analytics/client/AuthClient.java` — declaration:

```java
@FeignClient(name = "auth-service")
public interface AuthClient {
    @GetMapping("/auth/users/{userId}")
    UserDTO getUserById(@PathVariable Long userId);

    @GetMapping("/auth/users")
    List<UserDTO> getAllUsers();
}
```

- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/AuthClient.java` — declaration:

```java
@FeignClient(name = "auth-service")
public interface AuthClient {
    @GetMapping("/auth/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long userId);

    @GetMapping("/auth/validate")
    String validateToken();
}
```

These clients are invoked in their respective services to fetch user data or validate tokens.

## Recommendation / next steps

- Keep auth-service as a server-only service unless you have a clear need to call other services from inside it.  
- If you need to add Feign clients, follow the patterns above: enable Feign, declare typed interfaces in a `client` package, and inject them where needed.  
- Prefer explicit header forwarding via method arguments (`@RequestHeader`) to make dependencies and security explicit.

---

File created to document whether `auth-service` uses Feign and, since it does not, provide actionable guidance and examples for adding Feign-based calls if desired.
