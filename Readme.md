# Medicart Microservices Platform

## Overview

Medicart is a comprehensive e-commerce platform designed for medical supplies management. Built with a microservices architecture, it provides a scalable solution for pharmacies and healthcare providers to manage inventory, process orders, handle payments, and analyze sales data. The platform supports user authentication, role-based access control, medicine catalog management, shopping cart functionality, order processing with FIFO inventory management, payment integration, and analytics.

### Key Features

- **User Management**: Registration, login, JWT-based authentication, role-based access (Admin/User)
- **Medicine Catalog**: CRUD operations for medicines, batch tracking, expiry management, prescription requirements
- **Inventory Management**: FIFO-based order fulfillment, stock tracking, batch-wise quantity management
- **Shopping Cart & Orders**: Add to cart, place orders, order history, address management
- **Payment Processing**: Secure payment handling with transaction records
- **Analytics**: Dashboard with sales metrics, user statistics, and performance insights
- **API Gateway**: Centralized routing, CORS handling, load balancing
- **Service Discovery**: Eureka-based microservice registration and discovery

## Architecture

The platform follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Gateway   │────│  Microservices  │
│   (React/Vite)  │    │ (Spring Cloud   │    │                 │
│                 │    │   Gateway)      │    │ • Auth Service  │
└─────────────────┘    └─────────────────┘    │ • Admin Catalog │
                                              │ • Cart Orders   │
                                              │ • Payment       │
                                              │ • Analytics     │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Eureka Server │
                                              │ (Service        │
                                              │   Discovery)    │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Database      │
                                              │   (MySQL)       │
                                              └─────────────────┘
```

### Request Flow

1. **Frontend** sends HTTP requests to the API Gateway
2. **API Gateway** authenticates requests, applies CORS policies, and routes to appropriate microservices
3. **Microservices** handle business logic, communicate with each other via REST APIs
4. **Eureka Server** provides service discovery and load balancing
5. **Database** stores persistent data across multiple schemas

## Tech Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.4.2
- **Microservices**: Spring Cloud 2024.0.0
- **Database**: MySQL 8.0+
- **Build Tool**: Maven 3.6+
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Security**: JWT, Spring Security
- **ORM**: Spring Data JPA/Hibernate
- **Logging**: SLF4J with Logback

### Frontend
- **Language**: JavaScript (ES6+)
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.19
- **State Management**: Redux Toolkit 2.11.2
- **HTTP Client**: Axios 1.13.2
- **Routing**: React Router DOM 7.11.0
- **Forms**: React Hook Form 7.69.0
- **Charts**: Recharts 3.7.0
- **Icons**: Lucide React, React Icons, Heroicons

### DevOps & Tools
- **Version Control**: Git
- **IDE**: VS Code
- **Containerization**: Docker (optional)
- **Testing**: JUnit, Mockito (backend)
- **Linting**: ESLint (frontend)

## Services Overview

### 1. Eureka Server (Port: 8761)
- Service discovery and registration
- Load balancing for microservices
- Health monitoring

### 2. API Gateway (Port: 8080)
- Centralized entry point for all client requests
- CORS configuration
- Request routing and filtering
- Authentication middleware

### 3. Auth Service (Port: 8081)
- User registration and login
- JWT token generation and validation
- Role-based access control
- Prescription management

### 4. Admin Catalogue Service (Port: 8082)
- Medicine CRUD operations
- Batch management
- Inventory tracking
- Prescription requirements

### 5. Cart Orders Service (Port: 8083)
- Shopping cart management
- Order processing with FIFO logic
- Address management
- Order history

### 6. Payment Service (Port: 8086)
- Payment processing
- Transaction records
- Payment status tracking

### 7. Analytics Service (Port: 8085)
- Sales analytics
- User statistics
- Performance metrics
- Dashboard data

## Detailed Module Explanations

### 1. Eureka Server (Service Discovery)

**Port**: 8761  
**Purpose**: Acts as the service registry for all microservices, enabling dynamic service discovery and load balancing.

**Key Responsibilities**:
- Registers all microservices automatically
- Provides service health monitoring
- Enables client-side load balancing
- Supports service failover and recovery

**Configuration** (`application.properties`):
```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=true
```

**Key Classes**:
- `EurekaServerApplication.java`: Main Spring Boot application class
- Uses Netflix Eureka Server for service registration

**Interactions**:
- All microservices register with Eureka on startup
- API Gateway queries Eureka for service locations
- Provides dashboard at http://localhost:8761 for monitoring

### 2. API Gateway (Routing & Security)

**Port**: 8080  
**Purpose**: Centralized entry point for all client requests, handling routing, authentication, and cross-origin requests.

**Key Responsibilities**:
- Routes requests to appropriate microservices based on URL patterns
- Handles CORS (Cross-Origin Resource Sharing) for frontend communication
- Provides centralized authentication and authorization
- Implements rate limiting and request filtering

**Configuration** (`application.properties`):
```properties
server.port=8080
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
# Route definitions for each service
spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=lb://auth-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/auth/**,/api/auth/**
```

**Key Classes**:
- `ApiGatewayApplication.java`: Main application class
- `GlobalCorsConfiguration.java`: CORS configuration
- Route definitions in application.properties

**Routes**:
- `/auth/**` → Auth Service
- `/medicines/**` → Admin Catalogue Service
- `/api/cart/**` → Cart Orders Service
- `/api/orders/**` → Cart Orders Service
- `/api/analytics/**` → Analytics Service
- `/api/payment/**` → Payment Service

### 3. Auth Service (Authentication & User Management)

**Port**: 8081  
**Purpose**: Handles user authentication, registration, JWT token management, and user profile operations.

**Key Responsibilities**:
- User registration and login with password encryption
- JWT token generation and validation
- Role-based access control (USER, ADMIN)
- Prescription management for users
- Password reset functionality

**Database**: `auth_service_db`
- `users` table: User accounts with encrypted passwords
- `roles` table: User roles
- `prescriptions` table: User prescription records

**Key Classes**:
- `AuthController.java`: REST endpoints for auth operations
- `AuthService.java`: Business logic for authentication
- `JwtService.java`: JWT token handling
- `UserRepository.java`: Data access layer

**Endpoints**:
- `POST /auth/register`: User registration
- `POST /auth/login`: User authentication
- `GET /auth/validate`: Token validation
- `GET /auth/me`: Get current user profile
- `GET /prescriptions`: Get user prescriptions

**Security Features**:
- BCrypt password hashing
- JWT tokens with configurable expiration
- Role-based authorization

### 4. Admin Catalogue Service (Medicine & Inventory Management)

**Port**: 8082  
**Purpose**: Manages the medicine catalog, batch tracking, inventory control, and prescription requirements.

**Key Responsibilities**:
- CRUD operations for medicines
- Batch management with expiry tracking
- Inventory stock monitoring
- Prescription requirement enforcement
- Medicine search and filtering

**Database**: `admin_catalogue_db`
- `medicines` table: Medicine catalog with details, pricing, categories
- `batches` table: Batch information with quantities, expiry dates, costs
- `prescriptions` table: Prescription records

**Key Classes**:
- `MedicineController.java`: Medicine CRUD operations
- `BatchController.java`: Batch management
- `MedicineService.java`: Business logic for inventory
- `BatchService.java`: Batch processing logic

**Endpoints**:
- `GET /medicines`: List all medicines (with pagination)
- `POST /medicines`: Add new medicine (Admin only)
- `PUT /medicines/{id}`: Update medicine (Admin only)
- `DELETE /medicines/{id}`: Delete medicine (Admin only)
- `GET /batches`: Get batch information
- `POST /batches`: Add new batch (Admin only)

**Business Logic**:
- Automatic stock status calculation
- Expiry date validation
- Unique SKU generation
- Category-based organization

### 5. Cart Orders Service (Shopping Cart & Order Processing)

**Port**: 8083  
**Purpose**: Manages shopping cart operations, order placement, and implements FIFO inventory fulfillment.

**Key Responsibilities**:
- Shopping cart management (add, update, remove items)
- Order creation and processing
- FIFO (First In, First Out) inventory allocation
- Address management for delivery
- Order history and tracking

**Database**: `cart_orders_db`
- `cart_items` table: Shopping cart contents
- `orders` table: Order records
- `order_items` table: Items within orders
- `addresses` table: User delivery addresses

**Key Classes**:
- `CartController.java`: Cart operations
- `OrderController.java`: Order management
- `AddressController.java`: Address handling
- `CartService.java`: Cart business logic
- `OrderService.java`: Order processing with FIFO logic

**Endpoints**:
- `POST /api/cart/add`: Add item to cart
- `GET /api/cart`: Get cart contents
- `PUT /api/cart/update`: Update cart item quantity
- `DELETE /api/cart/remove/{itemId}`: Remove item from cart
- `POST /api/orders/place`: Place new order (triggers FIFO)
- `GET /api/orders`: Get user order history
- `POST /api/address`: Add delivery address

**FIFO Implementation**:
- Orders are fulfilled using oldest batches first
- Automatic batch quantity updates
- Prevents overselling of expired stock

### 6. Payment Service (Payment Processing)

**Port**: 8086  
**Purpose**: Handles payment processing, transaction records, and payment status management.

**Key Responsibilities**:
- Process payments for orders
- Record payment transactions
- Support multiple payment methods
- Payment status tracking
- Transaction history

**Database**: `payment_db`
- `payments` table: Payment records
- `transactions` table: Detailed transaction logs

**Key Classes**:
- `PaymentController.java`: Payment endpoints
- `PaymentService.java`: Payment processing logic
- `Payment.java` entity: Payment data model
- `Transaction.java` entity: Transaction details

**Endpoints**:
- `POST /api/payment/process`: Process payment
- `GET /api/payment/{orderId}`: Get payment details
- `GET /api/payment/transactions`: Get transaction history

**Payment Methods**:
- Credit Card
- Debit Card
- UPI
- Net Banking
- Cash on Delivery

### 7. Analytics Service (Data Analytics & Reporting)

**Port**: 8085  
**Purpose**: Provides analytics data, reports, and dashboard metrics for business intelligence.

**Key Responsibilities**:
- Generate sales reports
- Track user statistics
- Monitor inventory levels
- Provide dashboard data
- Performance metrics calculation

**Database**: `analytics_db`
- `analytics_data` table: Aggregated analytics information

**Key Classes**:
- `AnalyticsController.java`: Analytics endpoints
- `ReportController.java`: Report generation
- Analytics service classes for data aggregation

**Endpoints**:
- `GET /api/analytics/dashboard`: Get dashboard metrics
- `GET /api/analytics/sales`: Get sales reports
- `GET /api/analytics/inventory`: Get inventory reports

**Metrics Provided**:
- Total orders and revenue
- Customer statistics
- Medicine stock levels
- Low stock alerts
- Sales trends

### 8. Frontend (React Application)

**Port**: 5173 (development)  
**Purpose**: User interface for the entire platform, providing admin and customer portals.

**Key Responsibilities**:
- User authentication interface
- Medicine catalog browsing
- Shopping cart functionality
- Order management
- Admin dashboard for inventory management
- Payment processing UI
- Analytics visualization

**Technology Stack**:
- React 19.2.0 with Vite build tool
- Redux Toolkit for state management
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- React Hook Form for form handling

**Key Components**:
- `App.jsx`: Main application with routing
- Authentication features (Login, Register, OTP)
- Catalog features (HomePage, Medicine listings)
- Cart features (CartPage, Checkout)
- Admin features (AdminLayout, Products, Batches)
- Payment features (PaymentSelect, CardPayment, UPIPayment)

**State Management**:
- Redux slices for auth, cart, medicines
- Local storage for persistent authentication
- API integration with backend services

**Routing Structure**:
- Public routes: Home, Login, Register
- Protected user routes: Cart, Orders, Profile
- Protected admin routes: Dashboard, Products, Batches, Analytics

**Key Features**:
- Responsive design with Tailwind CSS
- JWT-based authentication
- Real-time cart updates
- Form validation with React Hook Form
- Charts and analytics with Recharts
- Toast notifications for user feedback

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/validate` - Token validation

### Medicine Management
- `GET /medicines` - List all medicines
- `POST /medicines` - Add new medicine (Admin)
- `PUT /medicines/{id}` - Update medicine (Admin)
- `DELETE /medicines/{id}` - Delete medicine (Admin)

### Cart & Orders
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `POST /api/orders/place` - Place order
- `GET /api/orders` - Get order history

### Payment
- `POST /api/payment/process` - Process payment
- `GET /api/payment/{orderId}` - Get payment details

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/sales` - Get sales metrics

## Database Schema

The platform uses multiple MySQL databases:

### Auth Service Database (`auth_service_db`)
- `users` - User accounts, roles, credentials
- `roles` - User roles (ADMIN, USER)
- `prescriptions` - User prescriptions

### Admin Catalogue Database (`admin_catalogue_db`)
- `medicines` - Medicine catalog with details
- `batches` - Batch information with quantities and expiry
- `prescriptions` - Prescription records

### Cart Orders Database (`cart_orders_db`)
- `cart_items` - Shopping cart items
- `orders` - Order records
- `order_items` - Items in orders
- `addresses` - User addresses

### Payment Database (`payment_db`)
- `payments` - Payment transactions
- `transactions` - Detailed transaction logs

### Analytics Database (`analytics_db`)
- `analytics_data` - Aggregated analytics data

## Getting Started

### Prerequisites
- Java Development Kit (JDK) 21
- Apache Maven 3.6+
- MySQL Server 8.0+
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahids444/Shaik.git
   cd Shaik
   ```

2. **Set up MySQL databases:**
   ```bash
   mysql -u root -p < all_db_structure.sql
   ```

3. **Configure environment:**
   - Update `microservices/*/src/main/resources/application.properties` with your MySQL credentials
   - Default configuration assumes MySQL running on localhost:3306

4. **Build backend services:**
   ```bash
   cd microservices
   mvn clean install -DskipTests
   ```

5. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Eureka Server:**
   ```bash
   cd microservices/eureka-server
   java -jar target/eureka-server-1.0.0.jar
   ```

2. **Start API Gateway:**
   ```bash
   cd ../api-gateway
   java -jar target/api-gateway-1.0.0.jar
   ```

3. **Start other microservices in any order:**
   ```bash
   cd ../auth-service
   java -jar target/auth-service-1.0.0.jar
   ```
   Repeat for `admin-catalogue-service`, `cart-orders-service`, `analytics-service`, `payment-service`

4. **Start frontend:**
   ```bash
   cd ../../frontend
   npm run dev
   ```

### Alternative: Use the startup script
```bash
cd microservices
./RUN_MICROSERVICES.sh
```

## Configuration

### Application Properties
Each microservice has its own `application.properties` file with configurations for:

- **Database**: JDBC URL, username, password
- **Eureka**: Service discovery settings
- **Server**: Port configuration
- **JWT**: Secret key, expiration time
- **Logging**: Log levels and patterns

### Environment Variables
- `MYSQL_HOST`: Database host (default: localhost)
- `MYSQL_PORT`: Database port (default: 3306)
- `MYSQL_USER`: Database username
- `MYSQL_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `EUREKA_HOST`: Eureka server host (default: localhost)

## Testing

### Backend Testing
```bash
cd microservices
mvn test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Manual Testing
Use the provided `TEST_API.bat` script or curl commands for API testing.

## Deployment

### Docker Deployment (Optional)
1. Build Docker images for each service
2. Use Docker Compose for orchestration
3. Configure environment variables in docker-compose.yml

### Production Considerations
- Use external MySQL instance
- Configure SSL/TLS
- Set up monitoring and logging
- Implement horizontal scaling
- Configure load balancers

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure no other applications are using ports 8761, 8080-8086, 5173
2. **Database connection**: Verify MySQL is running and credentials are correct
3. **Service discovery**: Check Eureka dashboard at http://localhost:8761
4. **CORS errors**: Verify API Gateway CORS configuration
5. **JWT issues**: Check JWT secret consistency across services

### Logs
- Backend logs: Check console output or `logs/` directory
- Frontend logs: Browser developer console
- Database logs: MySQL error logs

### Health Checks
- Eureka Dashboard: http://localhost:8761
- Service Health: http://localhost:{port}/actuator/health
- API Gateway Health: http://localhost:8080/actuator/health

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow Java naming conventions
- Use meaningful commit messages
- Write unit tests for new features
- Update documentation for API changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check existing documentation in the `docs/` folder
- Review troubleshooting section above

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Authors**: Medicart Development Team