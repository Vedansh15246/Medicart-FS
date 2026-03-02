# 🎯 MEDICART - Quick Interview Cheat Sheet

## 📌 Project Summary (30 seconds)
"Medicart is a microservices-based online medicine ordering platform built with Spring Boot and React. It features JWT authentication, FIFO batch allocation for inventory management, service discovery with Eureka, and an API Gateway for centralized security. The system handles user registration, medicine browsing, cart management, order processing, and payment integration across 5 independent microservices."

---

## 🏗️ Architecture (1 minute)

**Pattern:** Microservices Architecture  
**Services:** 7 total (1 Eureka, 1 Gateway, 5 Business Services)  
**Communication:** REST APIs via OpenFeign  
**Database:** MySQL (separate DB per service)  
**Frontend:** React with Redux

**Service Ports:**
- Eureka: 8761
- Gateway: 8080
- Auth: 8081
- Catalogue: 8082
- Cart/Orders: 8083
- Payment: 8084
- Analytics: 8085
- Frontend: 5173

---

## 🔐 Security Flow (1 minute)

1. User logs in → Auth Service generates JWT
2. Frontend stores JWT in localStorage
3. All requests include: `Authorization: Bearer <token>`
4. Gateway validates JWT (signature + expiration)
5. Gateway extracts userId and adds `X-User-Id` header
6. Services trust Gateway, read headers directly
7. No JWT validation in individual services

**Why?** Performance (validate once) + Simplicity (services don't need JWT libs)

---

## 🛒 Order Flow (2 minutes)

1. **Browse:** User views medicines from Catalogue Service
2. **Add to Cart:** Cart Service stores items (userId + medicineId + qty)
3. **Place Order:** 
   - Cart Service creates order (status: PENDING)
   - FIFO allocation: Get batches sorted by expiry date
   - Allocate from earliest expiry first
   - Create order_items with batch references
4. **Payment:** 
   - Payment Service processes payment
   - On success: calls Cart Service to finalize
5. **Finalize:**
   - Update order status: CONFIRMED
   - Reduce batch quantities in Catalogue Service
   - Clear user's cart

**Key:** Cart cleared AFTER payment, not after order creation

---

## 📦 FIFO Batch Allocation (1 minute)

**Problem:** Medicines have expiry dates, must use oldest first

**Solution:**
```
Medicine: Paracetamol, Need: 150 units

Batches (sorted by expiry):
- Batch A: Expiry 2024-03-01, Qty: 100
- Batch B: Expiry 2024-06-01, Qty: 80

Allocation:
1. Take 100 from Batch A (oldest)
2. Take 50 from Batch B (next oldest)
3. Create 2 order items with batch IDs
```

**Benefits:** Reduces waste, ensures quality, regulatory compliance

---

## 🔄 Service Discovery (1 minute)

**Problem:** Services need to find each other dynamically

**Solution: Netflix Eureka**
1. All services register with Eureka on startup
2. Gateway queries Eureka for service locations
3. Eureka performs health checks
4. If service fails, Eureka removes it
5. Gateway routes to healthy instances only

**Benefits:** No hardcoded IPs, automatic failover, dynamic scaling

---

## 💾 Database Design (1 minute)

**Pattern:** Database per Service

**Databases:**
- auth_db: users, roles
- catalogue_db: medicines, batches
- orders_db: cart_items, orders, order_items
- payment_db: payments
- analytics_db: statistics

**Why separate?**
- Loose coupling
- Independent scaling
- Technology freedom
- Fault isolation

---

## 🛠️ Tech Stack (30 seconds)

**Backend:**
- Spring Boot 3.4.2 (Java 21)
- Spring Security + JWT
- Spring Data JPA
- Spring Cloud (Gateway, Eureka, OpenFeign)
- MySQL 8.0

**Frontend:**
- React 18 + Vite
- Redux Toolkit
- Axios
- Tailwind CSS
- React Router v6

---

## 🎯 Key Features to Mention

1. **Microservices Architecture** - Independent, scalable services
2. **API Gateway Pattern** - Single entry point, centralized security
3. **Service Discovery** - Dynamic service registration with Eureka
4. **JWT Authentication** - Stateless, scalable security
5. **FIFO Inventory** - Batch allocation by expiry date
6. **Database per Service** - Data isolation and independence
7. **RESTful APIs** - Standard HTTP methods
8. **Admin Dashboard** - Analytics and order management
9. **Responsive UI** - Mobile-friendly React interface
10. **Payment Integration** - Order finalization workflow

---

## 🚀 Challenges & Solutions

### Challenge 1: JWT Validation in Every Service
**Problem:** Duplicating JWT validation logic  
**Solution:** Validate once at Gateway, services trust Gateway

### Challenge 2: Service Communication
**Problem:** Services need to call each other  
**Solution:** OpenFeign declarative REST clients

### Challenge 3: Medicine Expiry Management
**Problem:** Ensure oldest medicines sold first  
**Solution:** FIFO batch allocation algorithm

### Challenge 4: Cart Persistence
**Problem:** When to clear cart?  
**Solution:** Clear after payment success, not after order creation

### Challenge 5: Service Discovery
**Problem:** Services need to find each other  
**Solution:** Eureka Server for dynamic registration

---

## 📊 API Examples

### Register User
```http
POST http://localhost:8080/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

### Login
```http
POST http://localhost:8080/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
Response: { "token": "eyJhbGc..." }
```

### Get Medicines
```http
GET http://localhost:8080/medicines
Authorization: Bearer <token>
```

### Add to Cart
```http
POST http://localhost:8080/cart
Authorization: Bearer <token>
{
  "medicineId": 1,
  "quantity": 2
}
```

### Place Order
```http
POST http://localhost:8080/orders
Authorization: Bearer <token>
{
  "addressId": 1
}
```

---

## 🎤 Common Interview Questions

### Q1: Why microservices over monolithic?
**A:** Scalability (scale services independently), fault isolation (one service failure doesn't crash system), technology freedom (different tech per service), team autonomy (parallel development), independent deployment.

### Q2: How does API Gateway work?
**A:** Single entry point for all client requests. Validates JWT tokens, routes requests to appropriate services based on URL patterns, performs load balancing, handles cross-cutting concerns like logging and rate limiting.

### Q3: Explain JWT authentication flow
**A:** User logs in → Auth Service generates JWT with userId/role → Frontend stores in localStorage → All requests include token in Authorization header → Gateway validates token → Gateway adds X-User-Id header → Services read header directly.

### Q4: What is FIFO batch allocation?
**A:** First-In-First-Out inventory management. When order placed, system allocates medicines from batches with earliest expiry dates first. Ensures oldest stock used first, reduces waste, maintains quality.

### Q5: How do services communicate?
**A:** REST APIs using OpenFeign clients. Services discover each other via Eureka. Gateway routes external requests. Services make direct calls for internal communication.

### Q6: Why separate databases?
**A:** Each service owns its data (loose coupling), can scale independently, choose different database technologies, fault isolation (one DB failure doesn't affect all services).

### Q7: How is security handled?
**A:** JWT tokens for authentication, BCrypt for password hashing, Gateway validates all tokens, role-based access control (ROLE_USER, ROLE_ADMIN), CORS configuration, input validation.

### Q8: What happens when payment fails?
**A:** Order remains in PENDING status, cart not cleared, batch quantities not reduced, user can retry payment or cancel order.

### Q9: How to scale this system?
**A:** Run multiple instances of each service, Eureka handles load balancing, use Redis for caching, database read replicas, CDN for static assets, horizontal scaling of services.

### Q10: What improvements would you make?
**A:** Add Redis caching, implement event-driven architecture (Kafka/RabbitMQ), add monitoring (Prometheus/Grafana), implement circuit breakers (Resilience4j), add API rate limiting, implement distributed tracing (Zipkin).

---

## 💡 Pro Tips for Interview

1. **Start with overview** - Give 30-second summary first
2. **Use diagrams** - Draw architecture on whiteboard
3. **Explain trade-offs** - Why you chose this approach
4. **Mention alternatives** - Show you know other options
5. **Be specific** - Use actual port numbers, service names
6. **Show enthusiasm** - Talk about what you learned
7. **Admit unknowns** - Better than making up answers
8. **Ask questions** - Show interest in their architecture

---

## 🎯 Key Metrics to Remember

- **7 Services** (1 Eureka + 1 Gateway + 5 Business)
- **5 Databases** (separate per service)
- **8 Ports** (8761, 8080-8085, 5173)
- **2 Roles** (ROLE_USER, ROLE_ADMIN)
- **24 Hours** (JWT token validity)
- **4 Order Statuses** (PENDING, CONFIRMED, SHIPPED, DELIVERED)

---

## 🔥 Impressive Points to Mention

1. "Implemented centralized JWT validation at Gateway for performance"
2. "Used FIFO batch allocation to comply with pharmaceutical regulations"
3. "Designed database-per-service pattern for loose coupling"
4. "Implemented service discovery with Eureka for dynamic scaling"
5. "Used OpenFeign for declarative REST clients between services"
6. "Separated cart clearing from order creation for better UX"
7. "Implemented role-based access control for admin features"
8. "Used Redux for predictable state management in React"
9. "Designed RESTful APIs following industry best practices"
10. "Implemented transaction management for payment finalization"

---

**Remember: Confidence + Clarity + Specificity = Success! 🚀**

**Good Luck! 🎉**
