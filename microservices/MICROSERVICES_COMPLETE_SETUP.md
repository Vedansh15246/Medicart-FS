# MEDICART MICROSERVICES - COMPLETE SETUP GUIDE

## Architecture Overview

```
Port 8080: API Gateway (Request Routing)
    ├── Port 8761: Eureka Server (Service Discovery)
    ├── Port 8081: Auth Service (User Management + JWT)
    ├── Port 8082: Admin-Catalogue Service (Medicine & Batch Management)
    ├── Port 8083: Cart-Orders Service (Cart + FIFO Orders + Address)
    ├── Port 8085: Analytics Service (Reports & Analytics)
    └── Port 8086: Payment Service (Payment Processing)
```

## Database Setup

### 1. Create All Required Databases

```sql
-- Auth Service Database
CREATE DATABASE IF NOT EXISTS auth_service_db;

-- Admin Catalogue Database
CREATE DATABASE IF NOT EXISTS admin_catalogue_db;

-- Cart-Orders Database
CREATE DATABASE IF NOT EXISTS cart_orders_db;

-- Analytics Database
CREATE DATABASE IF NOT EXISTS analytics_db;

-- Payment Database
CREATE DATABASE IF NOT EXISTS payment_db;
```

### 2. Create Tables (Auto-created by JPA/Hibernate on startup)

Tables will be automatically created in each service's database based on entity definitions.

## Configuration Files

All services use `application.properties` (NOT YAML) for maximum compatibility and simplicity.

### Key Properties per Service:

**Eureka Server** (application.properties)
```properties
eureka.instance.hostname=localhost
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
server.port=8761
```

**API Gateway** (application.properties)
```properties
server.port=8080
spring.cloud.gateway.routes[0].uri=lb://auth-service
spring.cloud.gateway.routes[1].uri=lb://admin-catalogue-service
# ... routes for all 5 services
```

**Auth Service** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/auth_service_db
server.port=8081
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart-2025
```

**Admin-Catalogue Service** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/admin_catalogue_db
server.port=8082
```

**Cart-Orders Service** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cart_orders_db
server.port=8083
feign.client.config.default.connect-timeout=5000
```

**Analytics Service** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/analytics_db
server.port=8085
```

**Payment Service** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/payment_db
server.port=8086
```

## Starting the Services (Local Development)

### Step 1: Start Eureka Server
```bash
cd microservices/eureka-server
mvn spring-boot:run
# Wait for it to start (Port 8761)
# Check: http://localhost:8761/
```

### Step 2: Start API Gateway
```bash
cd microservices/api-gateway
mvn spring-boot:run
# Port 8080
```

### Step 3: Start Auth Service
```bash
cd microservices/auth-service
mvn spring-boot:run
# Port 8081
```

### Step 4: Start Admin-Catalogue Service
```bash
cd microservices/admin-catalogue-service
mvn spring-boot:run
# Port 8082
```

### Step 5: Start Cart-Orders Service
```bash
cd microservices/cart-orders-service
mvn spring-boot:run
# Port 8083
```

### Step 6: Start Analytics Service
```bash
cd microservices/analytics-service
mvn spring-boot:run
# Port 8085
```

### Step 7: Start Payment Service
```bash
cd microservices/payment-service
mvn spring-boot:run
# Port 8086
```

**Note**: All 7 services must be running together for full functionality. Use separate terminal windows or IDE launch configurations.

## Service Independence & Feign Communication

Each service is 100% independent with:
- Own database
- Own configuration (application.properties)
- Own business logic
- Own JPA entities and repositories

Inter-service communication via **Feign Clients**:

### Cart-Orders calls Admin-Catalogue:
```java
@FeignClient(name = "admin-catalogue-service")
public interface MedicineClient {
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable Long id);
    
    @GetMapping("/batches/{medicineId}/available")
    List<BatchDTO> getAvailableBatches(@PathVariable Long medicineId);
}
```

### Cart-Orders calls Auth Service:
```java
@FeignClient(name = "auth-service")
public interface AuthClient {
    @GetMapping("/auth/users/{id}")
    UserDTO getUserById(@PathVariable Long userId);
}
```

## Full Features per Service

### Auth Service (Port 8081)
- User Registration with email validation
- User Login with JWT token generation
- OTP-based email verification
- Password reset workflow
- User profile management
- Role-based access control (ROLE_USER, ROLE_ADMIN)

**Endpoints**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/validate` - Validate JWT token
- `GET /auth/users/{id}` - Get user details

### Admin-Catalogue Service (Port 8082)
- Medicine CRUD operations (Create, Read, Update, Delete)
- Batch management with expiry date tracking
- Medicine search and filtering
- Inventory management
- Stock availability checks

**Endpoints**:
- `GET /medicines` - List all medicines with pagination/search
- `GET /medicines/{id}` - Get medicine by ID
- `POST /medicines` - Create medicine (Admin only)
- `PUT /medicines/{id}` - Update medicine (Admin only)
- `DELETE /medicines/{id}` - Delete medicine (Admin only)
- `GET /batches` - List all batches
- `GET /batches/{id}` - Get batch by ID
- `GET /batches/{medicineId}/available` - Get available batches for medicine
- `POST /batches` - Create batch (Admin only)
- `PUT /batches/{id}` - Update batch (Admin only)
- `DELETE /batches/{id}` - Delete batch (Admin only)

### Cart-Orders Service (Port 8083)
- Shopping cart with UPSERT pattern (add/update/remove items)
- **FIFO (First-In-First-Out) order placement**:
  - Allocates stock from batch with earliest expiry date first
  - Automatically handles stock allocation across multiple batches
  - Ensures optimal stock rotation and minimal waste
- Order management and tracking
- Address management with multiple addresses per user
- Order history and status tracking

**Cart Endpoints**:
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add medicine to cart
- `PUT /api/cart/update/{itemId}` - Update cart item quantity
- `DELETE /api/cart/remove/{itemId}` - Remove from cart
- `DELETE /api/cart/clear` - Clear entire cart

**Order Endpoints**:
- `POST /api/orders/place` - Place order with FIFO allocation
- `GET /api/orders` - Get user orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status

**Address Endpoints**:
- `GET /api/address` - Get user addresses
- `GET /api/address/{id}` - Get address details
- `POST /api/address` - Add new address
- `PUT /api/address/{id}` - Update address
- `DELETE /api/address/{id}` - Delete address

### Analytics Service (Port 8085)
- Sales reports and analytics
- Inventory reports
- Dashboard metrics
- Custom report generation
- Real-time data fetching from Cart-Orders via Feign

**Endpoints**:
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/sales` - Get sales reports
- `GET /api/analytics/inventory` - Get inventory reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/{id}` - Get report details

### Payment Service (Port 8086)
- Payment processing
- Transaction management
- Payment status tracking
- Refund handling
- Integrated with Cart-Orders via Feign

**Endpoints**:
- `POST /api/payment/process` - Process payment
- `GET /api/payment/{orderId}` - Get payment status
- `POST /api/payment/refund` - Refund payment
- `GET /api/payment/transactions` - List transactions

## API Gateway Routes

All client requests go through API Gateway (Port 8080):

```
Client → http://localhost:8080/auth/** → Auth Service (8081)
Client → http://localhost:8080/medicines/** → Admin-Catalogue (8082)
Client → http://localhost:8080/batches/** → Admin-Catalogue (8082)
Client → http://localhost:8080/api/cart/** → Cart-Orders (8083)
Client → http://localhost:8080/api/orders/** → Cart-Orders (8083)
Client → http://localhost:8080/api/address/** → Cart-Orders (8083)
Client → http://localhost:8080/api/analytics/** → Analytics (8085)
Client → http://localhost:8080/api/reports/** → Analytics (8085)
Client → http://localhost:8080/api/payment/** → Payment (8086)
```

## Example Workflow: Complete User Journey

### 1. Register User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "fullName": "John Doe",
    "phone": "9876543210"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
# Returns JWT token
```

### 3. Browse Medicines
```bash
curl -X GET http://localhost:8080/medicines \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4. Add to Cart
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "medicineId": 1,
    "quantity": 2
  }'
```

### 5. Place Order (FIFO Allocation Happens Here)
```bash
curl -X POST http://localhost:8080/api/orders/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "addressId": 1
  }'
# FIFO algorithm automatically allocates stock from earliest expiry batch
```

### 6. Process Payment
```bash
curl -X POST http://localhost:8080/api/payment/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "orderId": 1,
    "amount": 500.0,
    "paymentMethod": "CARD"
  }'
```

### 7. View Analytics
```bash
curl -X GET http://localhost:8080/api/analytics/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Database Relationships

### Auth Service DB
```
User (1) ──→ (Many) Role
   - users table: id, email, password, full_name, phone, role_id
   - roles table: id, name
```

### Admin-Catalogue DB
```
Medicine (1) ──→ (Many) Batch
   - medicines: id, name, category, price, sku, requires_rx
   - batches: id, medicine_id, batch_no, expiry_date, qty_available
   - Index on (medicine_id, expiry_date) for FIFO queries
```

### Cart-Orders DB
```
User (1) ──→ (Many) CartItem
User (1) ──→ (Many) Address
User (1) ──→ (Many) Order ──→ (Many) OrderItem
   - cart_items: user_id, medicine_id, quantity (UNIQUE constraint)
   - addresses: user_id, address_line1, city, state, pincode
   - orders: id, user_id, order_date, total_amount, status, address_id
   - order_items: id, order_id, medicine_id, batch_id, quantity, price
```

## FIFO Stock Allocation Algorithm

Located in `Cart-Orders Service → OrderService.placeOrder()`:

```
1. Get user's cart items
2. For each cart item:
   a. Fetch all batches for medicine sorted by expiry_date ASC
   b. Initialize remaining_quantity = cart_item.quantity
   c. For each batch (oldest first):
      - allocated_qty = MIN(remaining_qty, batch.qty_available)
      - Create OrderItem with medicine, batch, allocated_qty
      - Decrease remaining_qty by allocated_qty
      - If remaining_qty == 0, break
   d. If remaining_qty > 0, throw error (insufficient stock)
3. Calculate total_amount = SUM(price * quantity for all OrderItems)
4. Save Order with all OrderItems
5. Clear user's cart
6. Return OrderDTO with all details
```

## Key Differences from Monolithic

✅ **Each service is completely independent**
✅ **Own database** - no shared DB across services
✅ **Own configuration** (application.properties)
✅ **Feign client communication** - loosely coupled
✅ **Service discovery via Eureka** - dynamic registration
✅ **API Gateway** - single entry point
✅ **JWT validation** - consistent security
✅ **FIFO algorithm preserved** - same stock allocation logic
✅ **All features implemented** - 100% feature parity

## Troubleshooting

### Service not registering with Eureka
- Check Eureka Server is running on port 8761
- Verify `eureka.client.service-url.defaultZone` points to correct Eureka URL
- Check firewall/network connectivity

### Feign client communication fails
- Ensure both services are running
- Check service name in @FeignClient matches application.name in properties
- Verify database is accessible

### JWT token issues
- Ensure `jwt.secret` is consistent across Auth and Gateway
- Token expiration set to 1 hour (3600000ms)
- Always pass token in `Authorization: Bearer <TOKEN>` header

### Database connection errors
- Verify MySQL is running
- Check datasource URL, username, password
- Ensure databases are created
- Check MySQL driver is in pom.xml

## Performance Tips

1. **Indexes**: Batch queries use index on (medicine_id, expiry_date)
2. **Connection Pooling**: HikariCP configured for optimal performance
3. **Feign Timeouts**: Set to 5 seconds (configurable)
4. **Caching**: Add Redis for frequently accessed medicines
5. **Pagination**: Implement for large result sets

## Production Deployment

For production, consider:
1. Use environment variables for sensitive config (DB credentials, JWT secret)
2. Enable HTTPS/TLS
3. Setup load balancing
4. Implement monitoring (Prometheus + Grafana)
5. Add logging aggregation (ELK stack)
6. Setup CI/CD pipeline
7. Database backup strategy
8. Rate limiting on API Gateway

---

**Version**: 1.0.0 Microservices
**Last Updated**: 2025-01-30
**Status**: Production Ready
