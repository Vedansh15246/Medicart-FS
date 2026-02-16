# Analytics Service Architecture

## Overview
The Analytics Service uses **Feign clients** to fetch data from existing microservice endpoints and computes analytics in real-time.

## Current Implementation Status

### ✅ Working Features (No Modifications Needed)
- **Product Catalog Analytics**: Fetches all medicines from `admin-catalogue-service`
- **Category Distribution**: Groups products by category
- **Stock Analysis**: Identifies in-stock vs out-of-stock products

### ⚠️ Limited Features (Requires Admin Endpoints)
The following analytics cannot be computed without adding admin endpoints to other services:
- User counts and growth metrics
- Order counts and revenue
- Top-selling products
- Order status distribution

---

## Feign Client Mappings

### 1. **AuthClient** → auth-service (Port 8081)
```java
@FeignClient(name = "auth-service")
public interface AuthClient {
    @GetMapping("/auth/users/{userId}")
    UserDTO getUserById(@PathVariable Long userId);
}
```

**Available Endpoints:**
- `GET /auth/users/{userId}` → Single user details
- `GET /auth/users/profile` → User profile (requires X-User-Id header)

**What's Missing for Analytics:**
- ❌ `GET /auth/admin/users/count` → Total user count
- ❌ `GET /auth/admin/users/all` → All users (for date-based analytics)

---

### 2. **CartOrdersClient** → cart-orders-service (Port 8083)
```java
@FeignClient(name = "cart-orders-service")
public interface CartOrdersClient {
    @GetMapping("/api/orders")
    List<OrderDTO> getAllOrdersForUser(@RequestHeader("X-User-Id") Long userId);
    
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrderById(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId);
}
```

**Available Endpoints:**
- `GET /api/orders` → Orders for specific user (requires X-User-Id header)
- `GET /api/orders/{orderId}` → Single order details
- `GET /api/cart` → Cart items for user
- `GET /api/cart/total` → Cart total amount

**What's Missing for Analytics:**
- ❌ `GET /api/admin/orders/all` → All orders (for revenue, status distribution)
- ❌ `GET /api/admin/orders/items/all` → All order items (for top products)

**Data Available in OrderDTO:**
```java
- Long id
- Long userId
- LocalDateTime orderDate
- Double totalAmount
- String status (PENDING, PROCESSING, DELIVERED, CANCELLED)
- Long addressId
- List<OrderItemDTO> items
```

**Data Available in OrderItemDTO:**
```java
- Long medicineId
- String medicineName
- Integer quantity
- Double priceAtPurchase
- Double subtotal
```

---

### 3. **CatalogueClient** → admin-catalogue-service (Port 8082)
```java
@FeignClient(name = "admin-catalogue-service")
public interface CatalogueClient {
    @GetMapping("/medicines")
    List<MedicineDTO> getAllMedicines();
    
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable Long id);
}
```

**Available Endpoints:**
- ✅ `GET /medicines` → All medicines (WORKS FOR ANALYTICS)
- ✅ `GET /medicines/{id}` → Single medicine details
- `GET /medicines/search?query={q}` → Search medicines
- `GET /batches` → All inventory batches
- `GET /batches/{medicineId}/available` → Available batches

**Data Available in MedicineDTO:**
```java
- Long id
- String name
- String category (e.g., "Pain Relief", "Antibiotics")
- Double price
- String sku
- Boolean inStock
- Integer totalQuantity
```

---

## Analytics Endpoints

### Current Working Endpoints

#### 1. `GET /api/admin/analytics/summary`
**Returns:** Analytics summary with product data
```json
{
  "totalUsers": 0,
  "totalOrders": 0,
  "totalRevenue": 0.0,
  "avgOrderValue": 0.0,
  "computedAt": "2026-02-13T18:00:00"
}
```

#### 2. `GET /api/admin/analytics/sales-by-category`
**Returns:** Product distribution by category (NOT actual sales without order data)
```json
[
  {
    "category": "Pain Relief",
    "productCount": 15,
    "salesCount": 0,
    "revenue": 0.0
  }
]
```

#### 3. `GET /api/admin/analytics/top-products`
**Returns:** Empty list (requires order data)

#### 4. `GET /api/admin/analytics/order-status-distribution`
**Returns:** Empty distribution (requires order data)

---

## How to Enable Full Analytics

### Option 1: Add Admin Endpoints (Recommended)

#### In **auth-service**:
```java
@RestController
@RequestMapping("/auth/admin")
public class AdminAnalyticsController {
    
    @GetMapping("/users/count")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(userRepository.count());
    }
    
    @GetMapping("/users/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
```

#### In **cart-orders-service**:
```java
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    
    @GetMapping("/all")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @GetMapping("/items/all")
    public ResponseEntity<List<OrderItemDTO>> getAllOrderItems() {
        return ResponseEntity.ok(orderService.getAllOrderItems());
    }
}
```

### Option 2: Direct Database Access (Not Recommended)
Analytics service could directly access other services' databases, but this violates microservice principles.

---

## Analytics Computation Logic

Once admin endpoints are added, analytics can be computed as follows:

### User Analytics
```java
List<UserDTO> allUsers = authClient.getAllUsers();
long totalUsers = allUsers.size();
long usersThisMonth = allUsers.stream()
    .filter(u -> u.getCreatedAt().isAfter(LocalDateTime.now().minusMonths(1)))
    .count();
```

### Revenue Analytics
```java
List<OrderDTO> allOrders = cartOrdersClient.getAllOrders();
double totalRevenue = allOrders.stream()
    .filter(o -> "DELIVERED".equals(o.getStatus()))
    .mapToDouble(OrderDTO::getTotalAmount)
    .sum();
```

### Top Products
```java
List<OrderDTO> allOrders = cartOrdersClient.getAllOrders();
Map<Long, Integer> productSales = allOrders.stream()
    .flatMap(o -> o.getItems().stream())
    .collect(Collectors.groupingBy(
        OrderItemDTO::getMedicineId,
        Collectors.summingInt(OrderItemDTO::getQuantity)
    ));
```

### Order Status Distribution
```java
List<OrderDTO> allOrders = cartOrdersClient.getAllOrders();
Map<String, Long> distribution = allOrders.stream()
    .collect(Collectors.groupingBy(
        OrderDTO::getStatus,
        Collectors.counting()
    ));
```

---

## Testing the Analytics Service

### Start Services in Order:
```bash
1. EurekaServerApplication (Port 8761)
2. AuthServiceApplication (Port 8081)
3. CartOrdersServiceApplication (Port 8083)
4. AdminCatalogueServiceApplication (Port 8082)
5. ApiGatewayApplication (Port 8080)
6. AnalyticsServiceApplication (Port 8084)
```

### Test Endpoints:
```bash
# Via API Gateway
curl http://localhost:8080/api/admin/analytics/summary
curl http://localhost:8080/api/admin/analytics/sales-by-category
curl http://localhost:8080/api/admin/analytics/top-products

# Direct to Analytics Service
curl http://localhost:8084/api/admin/analytics/summary
```

---

## Summary

✅ **What Works Now:**
- Product catalog analytics (categories, stock status)
- Service communication via Feign + Eureka
- API Gateway routing

⚠️ **What Needs Admin Endpoints:**
- User counts and growth
- Order revenue and trends
- Top-selling products
- Order status analytics

💡 **Best Practice:**
Add admin endpoints to existing services rather than modifying analytics service to access databases directly. This maintains microservice architecture principles.
