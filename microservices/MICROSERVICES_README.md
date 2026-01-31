# Medicart Microservices Architecture

## Overview

This is a complete microservices-based conversion of the Medicart pharmacy management application. The monolithic Spring Boot application has been split into 7 independent services with service discovery, API gateway, and inter-service communication via Feign clients.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (8080)                        │
│                   Spring Cloud Gateway                           │
│              (JWT Validation, Load Balancing)                   │
└─────────────────────────────────────────────────────────────────┘
                    ↓           ↓           ↓
        ┌──────────┴───┴──────────┬──────────┴──────┐
        ↓                         ↓                 ↓
    ┌─────────┐          ┌──────────────┐    ┌─────────────┐
    │   Auth  │          │   Admin      │    │ Cart-Orders │
    │ Service │          │ Catalogue    │    │  Service    │
    │ (8081)  │          │ Service      │    │  (8083)     │
    │         │          │ (8082)       │    │             │
    └─────────┘          └──────────────┘    └─────────────┘
        ↓                      ↓                   ↓
    Users, Roles        Medicines, Batches   Cart, Orders, Address
        ↓                                         ↓
    auth_service_db     admin_catalogue_db   cart_orders_db
            ↓                   ↓                   ↓
    ┌──────────────────────────────────────────────────────────┐
    │                      MySQL Database                       │
    │                   (Single or Distributed)                │
    └──────────────────────────────────────────────────────────┘
            ↑                   ↑                   ↑
    ┌─────────────┐     ┌──────────────┐    ┌────────────┐
    │ Analytics   │     │   Payment    │    │   Eureka   │
    │ Service     │     │   Service    │    │   Server   │
    │ (8085)      │     │ (8086)       │    │  (8761)    │
    └─────────────┘     └──────────────┘    └────────────┘
   analytics_db        payment_db         Service Discovery
```

## Services

### 1. **Eureka Server (Port 8761)**
- **Purpose**: Service discovery and registration
- **Features**:
  - Auto-registration of all microservices
  - Service lookup and load balancing
  - Health checks and monitoring
  - Dashboard: http://localhost:8761/

### 2. **API Gateway (Port 8080)**
- **Purpose**: Single entry point for all client requests
- **Features**:
  - Request routing to appropriate microservices
  - JWT token validation
  - Load balancing
  - Circuit breaking
  - Rate limiting (optional)
- **Routes**:
  - `/auth/**` → Auth Service (8081)
  - `/medicines/**` → Admin Catalogue (8082)
  - `/batches/**` → Admin Catalogue (8082)
  - `/api/cart/**` → Cart-Orders (8083)
  - `/api/orders/**` → Cart-Orders (8083)
  - `/api/address/**` → Cart-Orders (8083)
  - `/api/analytics/**` → Analytics (8085)
  - `/api/reports/**` → Analytics (8085)
  - `/api/payment/**` → Payment (8086)

### 3. **Auth Service (Port 8081)**
- **Database**: `auth_service_db`
- **Tables**: `users`, `roles`
- **Endpoints**:
  - `POST /auth/register` - User registration
  - `POST /auth/login` - User login with JWT
  - `POST /auth/send-otp` - OTP for email verification
  - `POST /auth/verify-otp` - OTP verification
  - `POST /auth/forgot-password` - Initiate password reset
  - `POST /auth/reset-password` - Complete password reset
  - `GET /auth/validate` - Token validation
- **JWT Claims**:
  - `sub`: user email
  - `scope`: user role (ROLE_USER, ROLE_ADMIN)
  - `email`: user email
  - `fullName`: user full name

### 4. **Admin Catalogue Service (Port 8082)**
- **Database**: `admin_catalogue_db`
- **Tables**: `medicines`, `batches`
- **Endpoints**:
  - `GET /medicines` - Get all medicines
  - `GET /medicines/{id}` - Get medicine by ID
  - `POST /medicines` - Create medicine (ADMIN only)
  - `PUT /medicines/{id}` - Update medicine (ADMIN only)
  - `DELETE /medicines/{id}` - Delete medicine (ADMIN only)
  - `GET /batches` - Get all batches
  - `GET /batches/{id}` - Get batch by ID
  - `POST /batches` - Create batch (ADMIN only)
  - `PUT /batches/{id}` - Update batch (ADMIN only)
  - `DELETE /batches/{id}` - Delete batch (ADMIN only)
- **Feign Clients**: Calls Auth Service for role validation (if needed)

### 5. **Cart-Orders Service (Port 8083)**
- **Database**: `cart_orders_db`
- **Tables**: `cart_items`, `orders`, `order_items`, `addresses`
- **Endpoints**:
  - `POST /api/cart/add` - Add item to cart
  - `PUT /api/cart/update/{itemId}` - Update cart item quantity
  - `DELETE /api/cart/remove/{itemId}` - Remove item from cart
  - `GET /api/cart` - Get user cart
  - `POST /api/orders/place` - Place order (FIFO allocation)
  - `GET /api/orders` - Get user orders
  - `GET /api/orders/{id}` - Get order details
  - `POST /api/address/add` - Add user address
  - `GET /api/address` - Get user addresses
  - `PUT /api/address/{id}` - Update address
  - `DELETE /api/address/{id}` - Delete address
- **Feign Clients**:
  - Calls Admin Catalogue for medicine/batch data
  - Calls Auth Service for user validation
- **FIFO Allocation**: When placing an order, stock is allocated from the batch with the earliest expiry date

### 6. **Analytics Service (Port 8085)**
- **Database**: `analytics_db`
- **Tables**: `reports`
- **Endpoints**:
  - `GET /api/analytics/dashboard` - Get analytics dashboard
  - `GET /api/analytics/sales` - Get sales reports
  - `GET /api/analytics/inventory` - Get inventory reports
  - `POST /api/reports/generate` - Generate custom report
  - `GET /api/reports` - Get all reports
  - `GET /api/reports/{id}` - Get report details
- **Feign Clients**:
  - Calls Cart-Orders for order data
  - Calls Admin Catalogue for inventory data

### 7. **Payment Service (Port 8086)**
- **Database**: `payment_db`
- **Tables**: `payments`, `transactions`
- **Endpoints**:
  - `POST /api/payment/process` - Process payment
  - `GET /api/payment/{orderId}` - Get payment status
  - `POST /api/payment/refund` - Refund payment
- **Feign Clients**:
  - Calls Cart-Orders to update order status after successful payment

## Database Schema

### Auth Service DB
```sql
CREATE DATABASE auth_service_db;

CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  role_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (name, description) VALUES
('ROLE_USER', 'Regular User'),
('ROLE_ADMIN', 'Administrator');
```

### Admin Catalogue DB
```sql
CREATE DATABASE admin_catalogue_db;

CREATE TABLE medicines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  requires_rx BOOLEAN DEFAULT FALSE,
  description TEXT,
  total_quantity INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE batches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  medicine_id BIGINT NOT NULL,
  batch_no VARCHAR(50) NOT NULL,
  expiry_date DATE NOT NULL,
  qty_available INT DEFAULT 0,
  version BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_batch (medicine_id, batch_no),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

CREATE INDEX idx_medicine_expiry ON batches(medicine_id, expiry_date);
```

### Cart-Orders DB
```sql
CREATE DATABASE cart_orders_db;

CREATE TABLE addresses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  label VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  medicine_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, medicine_id)
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  address_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  medicine_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  batch_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_orders ON orders(user_id);
CREATE INDEX idx_order_items ON order_items(order_id);
```

### Analytics DB
```sql
CREATE DATABASE analytics_db;

CREATE TABLE reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  data LONGTEXT NOT NULL,
  generated_by VARCHAR(100),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payment DB
```sql
CREATE DATABASE payment_db;

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
```

## Setup Instructions

### Prerequisites
- Java 21+
- Maven 3.8+
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)

### Local Development Setup

#### 1. Create Databases
```bash
mysql -u root -p < init-scripts/setup.sql
```

#### 2. Build All Services
```bash
cd microservices
mvn clean install
```

#### 3. Start Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
# Access: http://localhost:8761/
```

#### 4. Start API Gateway
```bash
cd api-gateway
mvn spring-boot:run
# Access: http://localhost:8080/
```

#### 5. Start Individual Services
In separate terminals:
```bash
# Auth Service
cd auth-service
mvn spring-boot:run

# Admin Catalogue Service
cd admin-catalogue-service
mvn spring-boot:run

# Cart-Orders Service
cd cart-orders-service
mvn spring-boot:run

# Analytics Service
cd analytics-service
mvn spring-boot:run

# Payment Service
cd payment-service
mvn spring-boot:run
```

### Docker Deployment

#### 1. Build Docker Images
```bash
cd microservices
mvn clean package -DskipTests

# Create Dockerfiles for each service (see Dockerfile examples below)

docker-compose build
```

#### 2. Start All Services
```bash
docker-compose up -d
```

#### 3. Check Service Status
```bash
docker-compose ps
docker-compose logs -f

# Eureka Dashboard: http://localhost:8761/
# API Gateway: http://localhost:8080/
```

#### 4. Stop Services
```bash
docker-compose down
```

## API Usage Examples

### 1. User Registration
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

### 2. User Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### 3. Get All Medicines
```bash
curl -X GET http://localhost:8080/medicines
```

### 4. Create Medicine (Admin)
```bash
curl -X POST http://localhost:8080/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "Aspirin",
    "category": "Painkillers",
    "price": 50.0,
    "sku": "ASP001",
    "requiresRx": false,
    "description": "Pain relief medicine"
  }'
```

### 5. Add Item to Cart
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "medicineId": 1,
    "quantity": 2
  }'
```

### 6. Place Order
```bash
curl -X POST http://localhost:8080/api/orders/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "addressId": 1
  }'
```

## Feign Client Configuration

### Example: Cart Service calling Admin Catalogue
```java
@FeignClient(name = "admin-catalogue-service")
public interface MedicineClient {
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable Long id);
    
    @GetMapping("/batches/{medicineId}/available")
    List<BatchDTO> getAvailableBatches(@PathVariable Long medicineId);
}
```

## Security

All services use:
- **JWT Authentication**: Token-based auth with HS256 algorithm
- **Role-Based Access Control (RBAC)**:
  - `ROLE_USER`: Regular users
  - `ROLE_ADMIN`: Administrators
- **Spring Security**: Method-level security with `@PreAuthorize`
- **OAuth2 Resource Server**: JWT validation

## FIFO Stock Allocation

When placing an order in Cart-Orders Service:
1. Retrieve all batches for the ordered medicine ordered by expiry date (ascending)
2. Allocate stock from the batch with earliest expiry date first
3. If quantity needed exceeds batch availability, move to next batch
4. Update batch quantity and create order items
5. Persist order with ACID compliance

## Monitoring & Logging

- **Eureka Dashboard**: http://localhost:8761/ - View all registered services
- **API Gateway Logs**: Monitor request routing and JWT validation
- **Service Logs**: Each service logs to console and optional file appenders

## Troubleshooting

### Service Not Registering with Eureka
```bash
# Check Eureka logs
docker logs medicart-eureka-server

# Verify network connectivity
docker network inspect medicart-network
```

### Database Connection Issues
```bash
# Verify MySQL is running
docker logs medicart-mysql

# Check database creation
mysql -u root -p -e "SHOW DATABASES;"
```

### JWT Token Issues
- Ensure token is passed in `Authorization: Bearer <TOKEN>` header
- Verify token hasn't expired
- Check JWT secret key matches across services

## Performance Considerations

1. **Batch Loading**: Use pagination for large datasets
2. **Caching**: Implement Redis for frequently accessed data
3. **Database Indexing**: Indexes on user_id, medicine_id, expiry_date
4. **Connection Pooling**: HikariCP configured for optimal performance
5. **Async Processing**: Use Spring Async for heavy operations

## Future Enhancements

1. Add Redis caching layer
2. Implement message queue (Kafka/RabbitMQ) for async operations
3. Add circuit breaker pattern (Hystrix/Resilience4j)
4. Implement distributed tracing (Sleuth + Zipkin)
5. Add API rate limiting and throttling
6. Implement comprehensive monitoring (Prometheus + Grafana)
7. Add API documentation (Swagger/OpenAPI for each service)
8. Implement automated testing and CI/CD pipeline

## Support & Contact

For issues or questions, refer to the technical documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-29  
**Architecture**: Microservices with Spring Cloud
