# Feign Client (Spring Cloud OpenFeign)

## What is Feign?

Feign (Spring Cloud OpenFeign) is a declarative HTTP client for Java powered by Spring. Instead of manually constructing RestTemplate/HttpClient calls, you declare a Java interface annotated with mapping annotations (@GetMapping, @PostMapping, etc.) and Feign generates the implementation at runtime that performs the HTTP calls to the target service.

Key benefits:
- Declarative API: define an interface, Feign implements it.  
- Strongly-typed: DTOs are used for request/response bodies making code easier to reason about.  
- Integrates with Spring Cloud (Eureka/Discovery, Ribbon/LoadBalancer) when configured — you can reference services by their logical name.  
- Reduce boilerplate: no manual serialization/deserialization or URL construction in service code.

## Why we use Feign in this project

- Microservice-to-microservice communication is frequent (analytics calling catalogue, payment calling cart-orders, cart-orders calling catalogue/auth). Feign keeps the calling code concise and expressive.  
- The project uses a service discovery pattern (Eureka). Feign + Spring Cloud lets interfaces reference services by name (e.g. `@FeignClient(name = "admin-catalogue-service")`) and the runtime resolves the network location.  
- Using DTOs shared via the `common` module ensures stable contracts between services and enables type-safe calls.

## Where Feign is used (examples in repo)

The repo contains several Feign clients under microservices/*/src/main/java/.../client. Notable examples:

- microservices/analytics-service/src/main/java/com/medicart/analytics/client/CatalogueClient.java
- microservices/analytics-service/src/main/java/com/medicart/analytics/client/AuthClient.java
- microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/MedicineClient.java
- microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/AuthClient.java
- microservices/payment-service/src/main/java/com/medicart/payment/client/CartOrdersClient.java

Also, each microservice that needs to use Feign enables it in its main application class, for example:

- `@EnableFeignClients` on `AdminCatalogueServiceApplication`, `AnalyticsServiceApplication`, `CartOrdersServiceApplication`, `PaymentServiceApplication` etc.

Search tip: look for `@FeignClient` and `@EnableFeignClients` in the `microservices/` tree.

## How we use Feign — code explained

Below is a typical Feign client from this project. This example is taken from `analytics-service` and shows the catalogue client the analytics service calls to fetch medicines or other data.

```java
@FeignClient(name = "admin-catalogue-service")
public interface CatalogueClient {
    @GetMapping("/medicines")
    List<MedicineDTO> getAllMedicines();

    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable Long id);

    @GetMapping("/api/analytics/sales-by-category")
    List<Map<String, Object>> getSalesByCategory();
}
```

Line-by-line explanation:
- `@FeignClient(name = "admin-catalogue-service")`: register this interface as a Feign client. The `name` matches the service id registered with Eureka (or the logical application name). At runtime Feign resolves where that service lives.
- `@GetMapping("/medicines")`: mapping annotation declares the HTTP method and path. Feign will call `GET /medicines` on the resolved host.
- Return types (e.g., `List<MedicineDTO>`): Feign uses Jackson (via Spring) to deserialize the JSON response into the DTOs defined in the `common` module.
- `@PathVariable` / `@RequestParam` / `@RequestHeader` can be used to pass URL path elements, query params, and headers respectively. Example in `payment` client uses `@RequestHeader("X-User-Id") Long userId` to transmit user context.

### Header propagation and user context

Frontend requests add `Authorization` and `X-User-Id` to HTTP requests (see `frontend/src/api/client.js`). When a microservice receives a request from the API Gateway or frontend, it may need to call another microservice while preserving some headers (for example, X-User-Id or Authorization). There are two common approaches:

1. Manually forward headers in controller/service and pass them into Feign calls as `@RequestHeader` parameters. This is explicit and visible in code (see `CartOrdersClient.clearCart(@RequestHeader("X-User-Id") Long userId)`).
2. Use Feign request interceptors (server-side) to automatically propagate headers from the incoming request into outgoing Feign requests. This requires access to the current HttpServletRequest (e.g., via RequestContextHolder) and a Feign `RequestInterceptor` bean.

This project primarily uses the explicit `@RequestHeader` style for the few endpoints that require user context.

## Example: Cart -> Payment -> CartOrders flow (how Feign is used)

When a user performs checkout from the frontend:

1. Frontend (via `client.js`) sends a POST to API Gateway (e.g., `/api/payments`) with `Authorization: Bearer <token>` and `X-User-Id` header.  
2. API Gateway routes to `payment-service`. The controller in `payment-service` receives the payment request.  
3. `payment-service` finalizes the payment, and needs to update order state and clear the cart in `cart-orders-service`. It uses `CartOrdersClient` (a Feign client) to call `cart-orders-service` endpoints like `/api/orders/{orderId}/finalize-payment` and `/api/cart/clear` (some endpoints accept `@RequestHeader("X-User-Id")` so user context is passed).
4. Feign, together with Eureka, resolves `cart-orders-service` and executes the HTTP calls; DTOs are exchanged between services.

Mermaid flow diagram (renderable in viewers that support mermaid):

```mermaid
flowchart TD
  Frontend[Frontend (Axios client)] -->|POST /api/payments\n(Authorization + X-User-Id)| APIGW[API Gateway]
  APIGW -->|route to| PaymentSvc[Payment Service]
  PaymentSvc -->|Feign: CartOrdersClient.finalizePayment| CartOrders[Cart-Orders Service]
  CartOrders -->|update order, clear cart| DB[(Orders DB)]
  PaymentSvc -->|Feign: CartOrdersClient.clearCart| CartOrders
  PaymentSvc -->|return| APIGW
  APIGW -->|response| Frontend

  style Frontend fill:#f9f,stroke:#333,stroke-width:1px
  style APIGW fill:#ff9,stroke:#333
  style PaymentSvc fill:#9ff,stroke:#333
  style CartOrders fill:#9f9,stroke:#333
  style DB fill:#eee,stroke:#333,stroke-dasharray: 5 5
```

## Error handling & resilience

- Feign supports Hystrix/Resilience4j for circuit breakers and fallback methods. This repository currently uses straightforward clients without explicit fallbacks in the interfaces. If you need higher resilience, consider adding:
  - Fallback classes (via `fallback = MyFallback.class` on `@FeignClient`) or
  - Configure Resilience4j decorators around Feign calls.

## Tips and best practices

- Keep Feign clients focused on RPC-like calls and DTOs from the `common` module. Avoid embedding business logic in the client.
- For calls that require headers like Authorization or X-User-Id, pass them explicitly via `@RequestHeader` parameters or implement a server-side Feign RequestInterceptor to propagate headers automatically.
- Keep endpoints versioned and stable; Feign clients are compiled against DTOs and changing DTOs requires updating dependent services.
- Prefer idempotent operations where possible; retries can cause duplicate requests if the remote endpoint isn't idempotent.

---

File created to document Feign usage across the microservices and provide concrete examples present in the codebase.
