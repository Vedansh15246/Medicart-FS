# 🎯 MEDICART - Complete Project Guide for Interview

## 📋 Project Overview

**Project Name:** Medicart - Online Medicine Ordering System  
**Architecture:** Microservices with Spring Boot & React  
**Type:** Full-Stack E-commerce Platform for Medicines

### Key Features
- User Authentication & Authorization (JWT)
- Medicine Catalog Management
- Shopping Cart & Order Processing
- Payment Integration
- Admin Dashboard with Analytics
- FIFO Batch Allocation System
- Real-time Service Discovery

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                      Port: 5173 (Vite)                          │
│  - User Interface                                               │
│  - Admin Dashboard                                              │
│  - State Management (Redux)                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Requests
                         │ (JWT Token in Header)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                     │
│  - Single Entry Point                                           │
│  - JWT Validation                                               │
│  - Request Routing                                              │
│  - Load Balancing                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Discovers Services
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EUREKA SERVER (Port 8761)                      │
│  - Service Registry                                             │
│  - Service Discovery                                            │
│  - Health Monitoring                                            │
└─────────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬────────────────┐
        │                │                │                │
        ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │   Catalogue  │ │ Cart/Orders  │ │   Payment    │
│  Port: 8081  │ │ Port: 8082   │ │ Port: 8083   │ │ Port: 8084   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  auth_db     │ │ catalogue_db │ │  orders_db   │ │  payment_db  │
│   MySQL      │ │    MySQL     │ │    MySQL     │ │    MySQL     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔄 Complete User Journey Workflow

### 1️⃣ USER REGISTRATION & LOGIN

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /auth/register
       │    {email, password, fullName, phone}
       ▼
┌─────────────────┐
│  API Gateway    │ 2. Routes to Auth Service
│  (Port 8080)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Auth Service   │ 3. Validate data
│  (Port 8081)    │ 4. Hash password (BCrypt)
└──────┬──────────┘ 5. Save to database
       │            6. Generate JWT token
       ▼
┌─────────────────┐
│   MySQL DB      │ 7. Store user record
│   (auth_db)     │
└─────────────────┘
       │
       │ 8. Return JWT token
       ▼
┌─────────────┐
│   Browser   │ 9. Store token in localStorage
└─────────────┘ 10. Redirect to home page
```

**Key Points:**
- Password encrypted with BCrypt (one-way hash)
- JWT token contains: userId, email, role
- Token valid for 24 hours
- Default role: ROLE_USER

---

### 2️⃣ BROWSING MEDICINES

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. GET /medicines
       │    Header: Authorization: Bearer <token>
       ▼
┌─────────────────┐
│  API Gateway    │ 2. Validate JWT token
│  (Port 8080)    │ 3. Extract userId from token
└──────┬──────────┘ 4. Add X-User-Id header
       │
       ▼
┌─────────────────┐
│   Catalogue     │ 5. Fetch medicines from DB
│   Service       │ 6. Filter by category/search
│  (Port 8082)    │ 7. Return medicine list
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   MySQL DB      │ 8. Query medicines table
│ (catalogue_db)  │    with batches (JOIN)
└─────────────────┘
       │
       │ 9. Return data
       ▼
┌─────────────┐
│   Browser   │ 10. Display medicine cards
└─────────────┘     with prices & availability
```

**Key Points:**
- Medicines linked to batches (one-to-many)
- Each batch has: expiry date, quantity, price
- Frontend shows lowest price from available batches

---

### 3️⃣ ADD TO CART

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /cart
       │    {medicineId, quantity}
       │    Header: Authorization: Bearer <token>
       ▼
┌─────────────────┐
│  API Gateway    │ 2. Validate JWT
│  (Port 8080)    │ 3. Extract userId
└──────┬──────────┘ 4. Forward with X-User-Id
       │
       ▼
┌─────────────────┐
│  Cart Service   │ 5. Check if item exists in cart
│  (Port 8083)    │ 6. If exists: update quantity
└──────┬──────────┘ 7. If new: create cart item
       │            8. Calculate price
       ▼
┌─────────────────┐
│   MySQL DB      │ 9. Save/Update cart_items
│   (orders_db)   │    (userId, medicineId, qty, price)
└─────────────────┘
       │
       │ 10. Return updated cart
       ▼
┌─────────────┐
│   Browser   │ 11. Update cart icon badge
└─────────────┘     12. Show success message
```

**Key Points:**
- Cart stored in database (not session)
- Each user has separate cart
- Cart persists across sessions
- Price fetched from catalogue service

---

### 4️⃣ PLACE ORDER (FIFO ALLOCATION)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /orders
       │    {addressId}
       │    Header: Authorization: Bearer <token>
       ▼
┌─────────────────┐
│  API Gateway    │ 2. Validate JWT
│  (Port 8080)    │ 3. Extract userId
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Cart Service   │ 4. Get user's cart items
│  (Port 8083)    │ 5. For each medicine:
└──────┬──────────┘
       │            ┌─────────────────────────────────┐
       │            │  FIFO BATCH ALLOCATION LOGIC    │
       │            │  ─────────────────────────────  │
       │            │  a. Get batches sorted by       │
       │            │     expiry date (earliest first)│
       │            │  b. Allocate from first batch   │
       │            │  c. If qty exceeds batch:       │
       │            │     move to next batch          │
       │            │  d. Create order items with     │
       │            │     batch references            │
       │            └─────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ Catalogue Svc   │ 6. Call: GET /batches/{medicineId}
│  (Port 8082)    │ 7. Return available batches
└─────────────────┘    sorted by expiry
       │
       ▼
┌─────────────────┐
│  Cart Service   │ 8. Create order record
│  (Port 8083)    │ 9. Create order items
└──────┬──────────┘ 10. Status: PENDING
       │            11. DO NOT clear cart yet
       ▼
┌─────────────────┐
│   MySQL DB      │ 12. Save order & order_items
│   (orders_db)   │     with batch_id references
└─────────────────┘
       │
       │ 13. Return orderId
       ▼
┌─────────────┐
│   Browser   │ 14. Redirect to payment page
└─────────────┘
```

**FIFO Example:**
```
Medicine: Paracetamol, Quantity Needed: 150

Available Batches:
- Batch A: Expiry 2024-03-01, Qty: 100, Price: 10
- Batch B: Expiry 2024-06-01, Qty: 80, Price: 12
- Batch C: Expiry 2024-09-01, Qty: 50, Price: 11

Allocation:
1. Take 100 from Batch A (earliest expiry)
2. Take 50 from Batch B (next earliest)
3. Total: 150 units allocated

Order Items Created:
- Item 1: medicineId, batchId=A, qty=100, price=10
- Item 2: medicineId, batchId=B, qty=50, price=12
```

---

### 5️⃣ PAYMENT PROCESSING

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /payment/process
       │    {orderId, paymentMethod}
       ▼
┌─────────────────┐
│  API Gateway    │ 2. Validate JWT
│  (Port 8080)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Payment Service │ 3. Get order details
│  (Port 8084)    │ 4. Validate amount
└──────┬──────────┘ 5. Process payment (demo)
       │            6. Generate transaction ID
       ▼
┌─────────────────┐
│   MySQL DB      │ 7. Save payment record
│  (payment_db)   │    (orderId, amount, status)
└─────────────────┘
       │
       │ 8. Payment SUCCESS
       ▼
┌─────────────────┐
│ Payment Service │ 9. Call Cart Service:
│  (Port 8084)    │    POST /orders/{id}/finalize
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Cart Service   │ 10. Update order status: CONFIRMED
│  (Port 8083)    │ 11. For each order item:
└──────┬──────────┘     Call Catalogue Service
       │
       ▼
┌─────────────────┐
│ Catalogue Svc   │ 12. Reduce batch quantities
│  (Port 8082)    │     PUT /batches/{id}/reduce
└──────┬──────────┘     {quantity: X}
       │
       ▼
┌─────────────────┐
│   MySQL DB      │ 13. Update batches table
│ (catalogue_db)  │     SET qty_available -= X
└─────────────────┘
       │
       │ 14. Clear user's cart
       ▼
┌─────────────────┐
│   MySQL DB      │ 15. DELETE FROM cart_items
│   (orders_db)   │     WHERE userId = X
└─────────────────┘
       │
       │ 16. Return success
       ▼
┌─────────────┐
│   Browser   │ 17. Show order confirmation
└─────────────┘     18. Display order details
```

**Key Points:**
- Cart cleared AFTER payment (not after order)
- Batch quantities reduced atomically
- Transaction ensures data consistency
- Order status: PENDING → CONFIRMED

---

## 🔐 Security Architecture

### JWT Token Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN REQUEST                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Auth Service: Generate JWT Token                           │
│  ─────────────────────────────────────────────────────────  │
│  Payload: {                                                 │
│    "sub": "user@example.com",                               │
│    "userId": 1,                                             │
│    "role": "ROLE_USER",                                     │
│    "iat": 1234567890,                                       │
│    "exp": 1234654290                                        │
│  }                                                          │
│  Signed with: SECRET_KEY                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: Store token in localStorage                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  All Subsequent Requests:                                   │
│  Header: Authorization: Bearer <token>                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway: Validate JWT                                  │
│  ─────────────────────────────────────────────────────────  │
│  1. Check signature (verify with SECRET_KEY)                │
│  2. Check expiration                                        │
│  3. Extract claims (userId, email, role)                    │
│  4. Add headers to request:                                 │
│     - X-User-Id: 1                                          │
│     - X-User-Email: user@example.com                        │
│     - X-User-Role: ROLE_USER                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Microservices: Trust Gateway                               │
│  ─────────────────────────────────────────────────────────  │
│  - No JWT validation needed                                 │
│  - Read X-User-* headers directly                           │
│  - Use userId for database queries                          │
└─────────────────────────────────────────────────────────────┘
```

**Why This Approach?**
- JWT validated once at Gateway (performance)
- Services don't need JWT libraries (simplicity)
- Centralized security (maintainability)
- Services trust Gateway (security boundary)

---

## 📊 Database Schema Overview

### Auth Service Database (auth_db)

```sql
roles
├── id (PK)
├── name (UNIQUE: ROLE_USER, ROLE_ADMIN)
└── description

users
├── id (PK)
├── email (UNIQUE)
├── password (BCrypt hashed)
├── full_name
├── phone
├── is_active
├── role_id (FK → roles.id)
├── created_at
└── updated_at
```

### Catalogue Service Database (catalogue_db)

```sql
medicines
├── id (PK)
├── name
├── description
├── manufacturer
├── category
├── requires_prescription
└── image_url

batches
├── id (PK)
├── medicine_id (FK → medicines.id)
├── batch_number (UNIQUE)
├── manufacturing_date
├── expiry_date
├── qty_available
├── price_per_unit
└── created_at
```

### Orders Service Database (orders_db)

```sql
cart_items
├── id (PK)
├── user_id
├── medicine_id
├── quantity
├── price
└── created_at

orders
├── id (PK)
├── user_id
├── order_date
├── total_amount
├── status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
├── address_id
└── delivery_date

order_items
├── id (PK)
├── order_id (FK → orders.id)
├── medicine_id
├── batch_id
├── quantity
├── price_at_purchase
├── unit_price
└── subtotal
```

### Payment Service Database (payment_db)

```sql
payments
├── id (PK)
├── order_id
├── user_id
├── amount
├── payment_method
├── transaction_id
├── status (SUCCESS, FAILED, PENDING)
└── payment_date
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.4.2
- **Language:** Java 21
- **Build Tool:** Maven
- **Database:** MySQL 8.0
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT
- **Service Discovery:** Netflix Eureka
- **API Gateway:** Spring Cloud Gateway
- **Inter-Service Communication:** OpenFeign

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **UI Library:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts

### DevOps
- **Version Control:** Git
- **API Testing:** Postman
- **Documentation:** Swagger/OpenAPI

---

## 🎯 Key Interview Points

### 1. Microservices Architecture
**Q: Why microservices over monolithic?**
- **Scalability:** Scale individual services independently
- **Technology Freedom:** Each service can use different tech
- **Fault Isolation:** One service failure doesn't crash entire system
- **Team Autonomy:** Different teams can work on different services
- **Deployment:** Deploy services independently

### 2. API Gateway Pattern
**Q: Why use API Gateway?**
- **Single Entry Point:** Clients call one endpoint
- **Security:** Centralized JWT validation
- **Routing:** Routes requests to correct service
- **Load Balancing:** Distributes load across instances
- **Cross-Cutting Concerns:** Logging, monitoring, rate limiting

### 3. Service Discovery (Eureka)
**Q: How do services find each other?**
- Services register with Eureka on startup
- Gateway queries Eureka for service locations
- Dynamic discovery (no hardcoded IPs)
- Health checks ensure only healthy services receive traffic
- Automatic failover if service goes down

### 4. FIFO Batch Allocation
**Q: Why FIFO for medicine batches?**
- **Regulatory Compliance:** Medicines have expiry dates
- **Waste Reduction:** Use oldest stock first
- **Quality Assurance:** Ensures fresh medicines to customers
- **Inventory Management:** Automatic stock rotation

### 5. JWT vs Session
**Q: Why JWT over sessions?**
- **Stateless:** No server-side session storage
- **Scalable:** Works across multiple servers
- **Mobile-Friendly:** Easy to use in mobile apps
- **Microservices:** Services don't share session store
- **Performance:** No database lookup for each request

### 6. Database Per Service
**Q: Why separate databases?**
- **Loose Coupling:** Services don't depend on each other's schema
- **Independent Scaling:** Scale databases independently
- **Technology Choice:** Use different databases (SQL, NoSQL)
- **Fault Isolation:** Database failure affects only one service
- **Data Ownership:** Each service owns its data

---

## 🚀 How to Run the Project

### Prerequisites
```bash
Java 21
Maven 3.8+
Node.js 16+
MySQL 8.0
```

### Step 1: Start Databases
```sql
CREATE DATABASE auth_service_db;
CREATE DATABASE catalogue_service_db;
CREATE DATABASE orders_service_db;
CREATE DATABASE payment_service_db;
CREATE DATABASE analytics_service_db;
```

### Step 2: Start Services (in order)
```bash
# 1. Eureka Server
cd microservices/eureka-server
mvn spring-boot:run

# 2. API Gateway
cd microservices/api-gateway
mvn spring-boot:run

# 3. All other services (parallel)
cd microservices/auth-service && mvn spring-boot:run
cd microservices/admin-catalogue-service && mvn spring-boot:run
cd microservices/cart-orders-service && mvn spring-boot:run
cd microservices/payment-service && mvn spring-boot:run
cd microservices/analytics-service && mvn spring-boot:run
```

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761

---

## 📈 Performance Optimizations

1. **Caching:** Redis for frequently accessed data
2. **Connection Pooling:** HikariCP for database connections
3. **Lazy Loading:** JPA lazy fetch for relationships
4. **Pagination:** Limit data returned in list APIs
5. **Indexing:** Database indexes on frequently queried columns
6. **Async Processing:** CompletableFuture for parallel operations

---

## 🔒 Security Best Practices

1. **Password Hashing:** BCrypt with salt
2. **JWT Expiration:** 24-hour token validity
3. **HTTPS:** SSL/TLS in production
4. **SQL Injection Prevention:** Parameterized queries (JPA)
5. **CORS Configuration:** Restrict allowed origins
6. **Input Validation:** Bean Validation (@Valid)
7. **Role-Based Access:** Admin vs User permissions

---

## 🎓 Learning Outcomes

- Microservices architecture design
- Spring Boot ecosystem (Security, Data JPA, Cloud)
- RESTful API development
- JWT authentication & authorization
- Service discovery & API Gateway patterns
- React state management with Redux
- Database design & relationships
- FIFO inventory management
- Payment integration
- Full-stack development workflow

---

**Good luck with your interview! 🚀**
