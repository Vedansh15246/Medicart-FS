# MediCart Complete Source Code Index

**Document Generated**: January 31, 2026  
**Total Files Documented**: 150+  
**Main Documentation**: See `COMPLETE_SOURCE_CODE_SUMMARY.md`

---

## Quick Navigation Index

### Frontend Files (React/Vite)

**Entry Point**
- [frontend/src/main.jsx](frontend/src/main.jsx) - React DOM render with Redux & React Query setup

**Main App & Routing**
- [frontend/src/App.jsx](frontend/src/App.jsx) - Route definitions for all pages
- [frontend/src/App.css](frontend/src/App.css) - App layout styles

**Styles & Design System**
- [frontend/src/index.css](frontend/src/index.css) - Global styles and CSS imports
- [frontend/src/styles/vars.css](frontend/src/styles/vars.css) - CSS variables and design tokens
- [frontend/src/styles/main.css](frontend/src/styles/main.css) - Base element styles
- [frontend/src/styles/global.css](frontend/src/styles/global.css) - Custom scrollbar styling

**Redux Store**
- [frontend/src/store/store.js](frontend/src/store/store.js) - Redux store configuration

**API Services & Clients**
- [frontend/src/api/client.js](frontend/src/api/client.js) - Axios HTTP client with JWT interceptor
- [frontend/src/api/authService.js](frontend/src/api/authService.js) - Authentication API methods
- [frontend/src/api/catalogService.js](frontend/src/api/catalogService.js) - Medicines & batches API
- [frontend/src/api/orderService.js](frontend/src/api/orderService.js) - Orders, cart, addresses API
- [frontend/src/api/paymentService.js](frontend/src/api/paymentService.js) - Payment processing API
- [frontend/src/api/analyticsService.js](frontend/src/api/analyticsService.js) - Analytics & reports API

### Catalog & Homepage

- [frontend/src/features/catalog/Homepage.jsx](frontend/src/features/catalog/Homepage.jsx) - Main medicine listing page
- [frontend/src/features/catalog/ProductCard.jsx](frontend/src/features/catalog/productCard.jsx) - Individual medicine card component
- [frontend/src/features/catalog/productSlice.jsx](frontend/src/features/catalog/productSlice.jsx) - Redux state for products
- [frontend/src/features/catalog/catalogApi.js](frontend/src/features/catalog/catalogApi.js) - Catalog API integration
- [frontend/src/features/catalog/MedicineIcons.js](frontend/src/features/catalog/MedicineIcons.js) - Category icon mappings
- [frontend/src/features/catalog/normalizeMedicineName.jsx](frontend/src/features/catalog/normalizeMedicineName.jsx) - Name normalization utility
- [frontend/src/features/catalog/home.css](frontend/src/features/catalog/home.css) - Homepage styles
- [frontend/src/features/catalog/product-card.css](frontend/src/features/catalog/product-card.css) - Card component styles

### Authentication

**Protected Routes**
- [frontend/src/features/auth/ProtectedRoute.jsx](frontend/src/features/auth/ProtectedRoute.jsx) - Route guard for authenticated users

**Auth Pages**
- [frontend/src/features/auth/pages/Login.jsx](frontend/src/features/auth/pages/Login.jsx) - User login page
- [frontend/src/features/auth/pages/Register.jsx](frontend/src/features/auth/pages/Register.jsx) - User registration page
- [frontend/src/features/auth/pages/ForgotPassword.jsx](frontend/src/features/auth/pages/ForgotPassword.jsx) - Forgot password form
- [frontend/src/features/auth/pages/Changepassword.jsx](frontend/src/features/auth/pages/Changepassword.jsx) - Change password form
- [frontend/src/features/auth/components/Auth.jsx](frontend/src/features/auth/components/Auth.jsx) - Reusable auth form component
- [frontend/src/features/auth/components/OtpPage.jsx](frontend/src/features/auth/components/OtpPage.jsx) - OTP verification page

**Auth Layouts**
- [frontend/src/features/auth/layout/General.jsx](frontend/src/features/auth/layout/General.jsx) - Auth page wrapper with navbar
- [frontend/src/features/auth/layout/ClientDashboard.jsx](frontend/src/features/auth/layout/ClientDashboard.jsx) - User dashboard layout

**Client Pages**
- [frontend/src/features/auth/pages/Accounts.jsx](frontend/src/features/auth/pages/Accounts.jsx) - User profile management
- [frontend/src/features/auth/pages/Prescription.jsx](frontend/src/features/auth/pages/Prescription.jsx) - Prescription upload & history

### Delivery & Addresses

- [frontend/src/features/delivery/AddressPage.jsx](frontend/src/features/delivery/AddressPage.jsx) - Address management page
- [frontend/src/features/delivery/AddressForm.jsx](frontend/src/features/delivery/AddressForm.jsx) - Add/edit address form
- [frontend/src/features/delivery/AddressList.jsx](frontend/src/features/delivery/AddressList.jsx) - Display saved addresses

### Shopping Cart

- [frontend/src/components/cart/CartPage.jsx](frontend/src/components/cart/CartPage.jsx) - Shopping cart view
- [frontend/src/components/cart/cartSlice.js](frontend/src/components/cart/cartSlice.js) - Redux store for cart
- [frontend/src/components/cart/cartSummary.jsx](frontend/src/components/cart/cartSummary.jsx) - Cart summary component
- [frontend/src/components/cart/cartSummary.css](frontend/src/components/cart/cartSummary.css) - Cart styles

### Orders

- [frontend/src/features/order/MyOrdersPage.jsx](frontend/src/features/order/MyOrdersPage.jsx) - User's order history
- [frontend/src/features/order/OrderDetailsPage.jsx](frontend/src/features/order/OrderDetailsPage.jsx) - Order detail view

### Payment & Checkout

- [frontend/src/features/payment/MediCartModule4.jsx](frontend/src/features/payment/MediCartModule4.jsx) - Payment module wrapper
- [frontend/src/features/payment/CheckoutPage.jsx](frontend/src/features/payment/CheckoutPage.jsx) - Checkout & order confirmation
- [frontend/src/features/payment/PaymentsPage.jsx](frontend/src/features/payment/PaymentsPage.jsx) - Payment history
- [frontend/src/features/payment/InvoicePage.jsx](frontend/src/features/payment/InvoicePage.jsx) - Invoice display
- [frontend/src/features/payment/PaymentSelect.jsx](frontend/src/features/payment/PaymentSelect.jsx) - Payment method selection
- [frontend/src/features/payment/CardPayment.jsx](frontend/src/features/payment/CardPayment.jsx) - Credit/debit card form
- [frontend/src/features/payment/DebitCard.jsx](frontend/src/features/payment/DebitCard.jsx) - Debit card payment
- [frontend/src/features/payment/Theme.css](frontend/src/features/payment/Theme.css) - Payment module styles
- [frontend/src/features/payment/PaymentsPage.css](frontend/src/features/payment/PaymentsPage.css) - Payment page styles
- [frontend/src/features/payment/CheckoutPage.css](frontend/src/features/payment/CheckoutPage.css) - Checkout styles
- [frontend/src/features/payment/InvoicePage.css](frontend/src/features/payment/InvoicePage.css) - Invoice styles

### Admin Panel

**Admin Authentication & Layout**
- [frontend/src/features/admin/AdminLoginPage.jsx](frontend/src/features/admin/AdminLoginPage.jsx) - Admin login form
- [frontend/src/features/admin/AdminLayout.jsx](frontend/src/features/admin/AdminLayout.jsx) - Admin dashboard layout
- [frontend/src/features/admin/adminAuth.js](frontend/src/features/admin/adminAuth.js) - Admin auth helper functions

**Admin Pages**
- [frontend/src/features/admin/AdminProductsPage.jsx](frontend/src/features/admin/AdminProductsPage.jsx) - Medicine management
- [frontend/src/features/admin/AdminBatchPage.jsx](frontend/src/features/admin/AdminBatchPage.jsx) - Batch & inventory management
- [frontend/src/features/admin/AdminOrdersPage.jsx](frontend/src/features/admin/AdminOrdersPage.jsx) - View all orders
- [frontend/src/features/admin/AdminUsersPage.jsx](frontend/src/features/admin/AdminUsersPage.jsx) - User management

**Admin Components & Tables**
- [frontend/src/features/admin/ProductsTable.jsx](frontend/src/features/admin/ProductsTable.jsx) - Medicines data table
- [frontend/src/features/admin/ProductEditorModal.jsx](frontend/src/features/admin/ProductEditorModal.jsx) - Add/edit medicine modal
- [frontend/src/features/admin/BatchTable.jsx](frontend/src/features/admin/BatchTable.jsx) - Batches data table
- [frontend/src/features/admin/BatchEditorModal.jsx](frontend/src/features/admin/BatchEditorModal.jsx) - Add/edit batch modal
- [frontend/src/features/admin/OrdersTable.jsx](frontend/src/features/admin/OrdersTable.jsx) - Orders data table
- [frontend/src/features/admin/OrderStatusModal.jsx](frontend/src/features/admin/OrderStatusModal.jsx) - Update order status modal
- [frontend/src/features/admin/UsersTable.jsx](frontend/src/features/admin/UsersTable.jsx) - Users data table

**Admin Analytics**
- [frontend/src/features/admin/analyticsSecction/Dashboard.jsx](frontend/src/features/admin/analyticsSecction/Dashboard.jsx) - Analytics dashboard
- [frontend/src/features/admin/analyticsSecction/Reports.jsx](frontend/src/features/admin/analyticsSecction/Reports.jsx) - Reports page
- [frontend/src/features/admin/analyticsSecction/StatCard.jsx](frontend/src/features/admin/analyticsSecction/StatCard.jsx) - Statistics card component

**Admin API & Styles**
- [frontend/src/features/admin/adminApi.js](frontend/src/features/admin/adminApi.js) - Admin API integration
- [frontend/src/features/admin/batchApi.js](frontend/src/features/admin/batchApi.js) - Batch API integration
- [frontend/src/features/admin/admin.css](frontend/src/features/admin/admin.css) - Admin panel styles
- [frontend/src/features/admin/AdminLogin.css](frontend/src/features/admin/AdminLogin.css) - Login form styles
- [frontend/src/features/admin/batch.css](frontend/src/features/admin/batch.css) - Batch page styles
- [frontend/src/features/admin/ProductsTable.css](frontend/src/features/admin/ProductsTable.css) - Table styles

### Shared Components

**Navigation**
- [frontend/src/components/navbar/Navbar.jsx](frontend/src/components/navbar/Navbar.jsx) - Main navbar component
- [frontend/src/components/navbar/navbar.css](frontend/src/components/navbar/navbar.css)
- [frontend/src/components/navbar-1/Navbar.jsx](frontend/src/components/navbar-1/Navbar.jsx) - Alternative navbar
- [frontend/src/components/navbar-1/navbar.css](frontend/src/components/navbar-1/navbar.css)

**Layout**
- [frontend/src/components/layout/Header.jsx](frontend/src/components/layout/Header.jsx) - Header component
- [frontend/src/components/layout/Footer.jsx](frontend/src/components/layout/Footer.jsx) - Footer component
- [frontend/src/components/layout/AdminSidebar.jsx](frontend/src/components/layout/AdminSidebar.jsx) - Admin sidebar

**Modals & UI**
- [frontend/src/components/modal/MedicineModal.jsx](frontend/src/components/modal/MedicineModal.jsx) - Medicine details popup
- [frontend/src/components/modal/medicineModal.css](frontend/src/components/modal/medicineModal.css)
- [frontend/src/components/ui/Loader.jsx](frontend/src/components/ui/Loader.jsx) - Loading spinner

---

## Java Microservices Files

### Common Module

**DTOs (Data Transfer Objects)**
- `microservices/common/src/main/java/com/medicart/common/dto/LoginRequest.java`
- `microservices/common/src/main/java/com/medicart/common/dto/LoginResponse.java`
- `microservices/common/src/main/java/com/medicart/common/dto/RegisterRequest.java`
- `microservices/common/src/main/java/com/medicart/common/dto/UserDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/MedicineDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/BatchDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/CartItemDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/OrderDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/OrderItemDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/AddressDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/PaymentDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/ReportDTO.java`

### Eureka Server (Port 8761)

- `microservices/eureka-server/src/main/java/com/medicart/eureka/EurekaServerApplication.java`

### API Gateway (Port 8080)

- `microservices/api-gateway/src/main/java/com/medicart/gateway/ApiGatewayApplication.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/GatewayConfig.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/SecurityConfig.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/WebSecurityConfig.java`

### Auth Service (Port 8081)

**Main Class & Configuration**
- `microservices/auth-service/src/main/java/com/medicart/auth/AuthServiceApplication.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/WebSecurityConfig.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/JwtConfigProperties.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/DataInitializer.java`

**Controllers**
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/AuthController.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/UserController.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/OtpController.java`

**Services**
- `microservices/auth-service/src/main/java/com/medicart/auth/service/AuthService.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/service/JwtService.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/service/OtpService.java`

**Entities**
- `microservices/auth-service/src/main/java/com/medicart/auth/entity/User.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/entity/Role.java`

**Repositories**
- `microservices/auth-service/src/main/java/com/medicart/auth/repository/UserRepository.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/repository/RoleRepository.java`

### Admin Catalogue Service (Port 8082)

**Main Class & Configuration**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/AdminCatalogueServiceApplication.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/config/WebSecurityConfig.java`

**Controllers**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/MedicineController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/BatchController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/PrescriptionController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/SeedController.java`

**Services**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/service/MedicineService.java`

**Entities**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/entity/Medicine.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/entity/Batch.java`

**Repositories**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/repository/MedicineRepository.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/repository/BatchRepository.java`

### Cart-Orders Service (Port 8083)

**Main Class & Configuration**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/CartOrdersServiceApplication.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/config/WebSecurityConfig.java`

**Controllers**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/CartController.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/OrderController.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/AddressController.java`

**Services**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/CartService.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/OrderService.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/AddressService.java`

**Feign Clients**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/MedicineClient.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/AuthClient.java`

**Entities**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/CartItem.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/Order.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/OrderItem.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/Address.java`

**Repositories**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/CartItemRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/OrderRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/OrderItemRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/AddressRepository.java`

### Payment Service (Port 8086)

**Main Class & Configuration**
- `microservices/payment-service/src/main/java/com/medicart/payment/PaymentServiceApplication.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/config/WebSecurityConfig.java`

**Controllers**
- `microservices/payment-service/src/main/java/com/medicart/payment/controller/PaymentController.java`

**Services**
- `microservices/payment-service/src/main/java/com/medicart/payment/service/PaymentService.java`

**Feign Clients**
- `microservices/payment-service/src/main/java/com/medicart/payment/client/CartOrdersClient.java`

**Entities**
- `microservices/payment-service/src/main/java/com/medicart/payment/entity/Payment.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/entity/Transaction.java`

**Repositories**
- `microservices/payment-service/src/main/java/com/medicart/payment/repository/PaymentRepository.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/repository/TransactionRepository.java`

### Analytics Service (Port 8085)

**Main Class & Configuration**
- `microservices/analytics-service/src/main/java/com/medicart/analytics/AnalyticsServiceApplication.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/config/WebSecurityConfig.java`

**Controllers**
- `microservices/analytics-service/src/main/java/com/medicart/analytics/controller/AnalyticsController.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/controller/ReportController.java`

---

## Database & SQL Files

- [microservices/db-setup.sql](microservices/db-setup.sql) - Complete database schema for all 5 microservices
- [microservices/UPDATE_ADMIN_PASSWORD.sql](microservices/UPDATE_ADMIN_PASSWORD.sql) - Admin password update script
- [microservices/MIGRATION_FIX_ADDRESS_TABLE.sql](microservices/MIGRATION_FIX_ADDRESS_TABLE.sql) - Database migration for address table

---

## Billing Module

- [medicart-billing/src/App.jsx](medicart-billing/src/App.jsx)
- [medicart-billing/src/api/billingPaymentAPI.js](medicart-billing/src/api/billingPaymentAPI.js)
- [medicart-billing/src/pages/Billing.jsx](medicart-billing/src/pages/Billing.jsx)
- [medicart-billing/src/pages/BillingPage.jsx](medicart-billing/src/pages/BillingPage.jsx)
- [medicart-billing/src/pages/PaymentPage.jsx](medicart-billing/src/pages/PaymentPage.jsx)
- [medicart-billing/src/pages/CheckoutPage.jsx](medicart-billing/src/pages/CheckoutPage.jsx)
- [medicart-billing/src/pages/PaymentSelect.jsx](medicart-billing/src/pages/PaymentSelect.jsx)
- [medicart-billing/src/pages/CardPayment.jsx](medicart-billing/src/pages/CardPayment.jsx)
- [medicart-billing/src/pages/NetBanking.jsx](medicart-billing/src/pages/NetBanking.jsx)
- [medicart-billing/src/pages/DebitCard.jsx](medicart-billing/src/pages/DebitCard.jsx)
- [medicart-billing/src/pages/Success.jsx](medicart-billing/src/pages/Success.jsx)
- [medicart-billing/src/components/CartSummary.jsx](medicart-billing/src/components/CartSummary.jsx)
- [medicart-billing/src/components/PaymentOptions.jsx](medicart-billing/src/components/PaymentOptions.jsx)
- [medicart-billing/src/components/ProgressBar.jsx](medicart-billing/src/components/ProgressBar.jsx)
- [medicart-billing/src/data/mockInvoices.js](medicart-billing/src/data/mockInvoices.js)

---

## Documentation Files

**Root Level**
- [COMPLETE_SOURCE_CODE_SUMMARY.md](COMPLETE_SOURCE_CODE_SUMMARY.md) - **MAIN DOCUMENTATION** - Comprehensive system overview
- [COMPLETE_SOURCE_CODE_INDEX.md](COMPLETE_SOURCE_CODE_INDEX.md) - This file - Quick reference index

**Architecture & Setup**
- [microservices/MICROSERVICES_README.md](microservices/MICROSERVICES_README.md) - Microservices architecture guide
- [microservices/MICROSERVICES_COMPLETE_SETUP.md](microservices/MICROSERVICES_COMPLETE_SETUP.md) - Complete setup instructions
- [microservices/MICROSERVICES_AUDIT_REPORT.md](microservices/MICROSERVICES_AUDIT_REPORT.md) - Architecture audit findings
- [microservices/COMPLETION_STATUS.md](microservices/COMPLETION_STATUS.md) - Project completion status
- [microservices/FINAL_COMPLETION_SUMMARY.md](microservices/FINAL_COMPLETION_SUMMARY.md) - Final completion report
- [microservices/VERIFICATION_REPORT.md](microservices/VERIFICATION_REPORT.md) - System verification results

---

## File Organization

```
Total Files: 150+

Frontend:
- React Components: 50+
- CSS Files: 15+
- API Services: 5
- Configuration: 2

Microservices:
- Java Files: 50+
- Configuration: 20+
- Entity/DTO Classes: 30+
- Controller Classes: 15+
- Service Classes: 10+

Database:
- SQL Scripts: 3
- Database Schema: 5 databases

Documentation:
- Markdown Files: 15+
```

---

## How to Use This Index

1. **For Frontend Code**: Navigate to `frontend/src/`
2. **For Backend Code**: Navigate to `microservices/*/src/main/java/com/medicart/`
3. **For Database Schema**: See `microservices/db-setup.sql`
4. **For Setup Instructions**: See `microservices/MICROSERVICES_COMPLETE_SETUP.md`
5. **For Main Documentation**: See `COMPLETE_SOURCE_CODE_SUMMARY.md`

---

**Last Updated**: January 31, 2026  
**Status**: Complete Source Code Documentation  
**Version**: 1.0.0

# MediCart Complete Source Code Summary

**Generated**: January 31, 2026  
**Project Root**: `c:\Users\SHAHID\OneDrive\Desktop\Project`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Frontend (React/Vite) - Complete Source](#frontend-complete-source)
3. [Microservices (Spring Boot Java) - Complete Source](#microservices-complete-source)
4. [MediCart Billing Module](#medicart-billing-module)
5. [Database Schema & SQL](#database-schema--sql)
6. [Architecture Summary](#architecture-summary)

---

## Project Overview

**MediCart** is a full-stack pharmacy management system built with:
- **Frontend**: React 18 + Redux + Vite + TailwindCSS
- **Backend**: Java Spring Boot Microservices with Eureka, API Gateway, and Feign clients
- **Databases**: MySQL (separate DB per microservice)
- **Architecture**: Microservices with service discovery and API gateway

**Key Features**:
- User authentication with JWT & OTP verification
- Medicine catalog with inventory management
- Shopping cart with FIFO stock allocation
- Order management with delivery tracking
- Payment processing
- Admin dashboard with analytics
- Prescription upload & management

---

## FRONTEND COMPLETE SOURCE

### Directory Structure
```
frontend/src/
├── main.jsx                          # React entry point
├── App.jsx                           # Main app routes
├── App.css                           # App styles
├── index.css                         # Global styles
├── store/
│   └── store.js                      # Redux store configuration
├── api/
│   ├── client.js                     # Axios HTTP client with interceptors
│   ├── authService.js                # Authentication API calls
│   ├── catalogService.js             # Medicines & batches API
│   ├── orderService.js               # Orders, cart, addresses API
│   ├── paymentService.js             # Payment API
│   └── analyticsService.js           # Analytics & reports API
├── styles/
│   ├── vars.css                      # CSS variables & design tokens
│   ├── main.css                      # Base styles
│   └── global.css                    # Custom scrollbar styles
├── components/
│   ├── navbar/
│   │   ├── Navbar.jsx
│   │   └── navbar.css
│   ├── navbar-1/
│   │   ├── Navbar.jsx
│   │   └── navbar.css
│   ├── cart/
│   │   ├── CartPage.jsx              # Shopping cart view
│   │   ├── cartSlice.js              # Cart Redux state
│   │   ├── cartSummary.jsx
│   │   └── cartSummary.css
│   ├── modal/
│   │   ├── MedicineModal.jsx         # Medicine details popup
│   │   └── medicineModal.css
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── AdminSidebar.jsx
│   └── ui/
│       └── Loader.jsx
├── features/
│   ├── catalog/
│   │   ├── Homepage.jsx              # Main medicine listing page
│   │   ├── ProductCard.jsx           # Individual medicine card
│   │   ├── productCard.css
│   │   ├── productSlice.jsx          # Redux store for products
│   │   ├── catalogApi.js             # Catalog service integration
│   │   ├── MedicineIcons.js          # Icon mapping for categories
│   │   ├── normalizeMedicineName.jsx  # Utility function
│   │   ├── home.css
│   │   └── product-card.css
│   ├── auth/
│   │   ├── ProtectedRoute.jsx        # Route guard for logged-in users
│   │   ├── pages/
│   │   │   ├── Login.jsx             # User login page
│   │   │   ├── Register.jsx          # User registration page
│   │   │   ├── ForgotPassword.jsx    # Password reset request
│   │   │   ├── Changepassword.jsx    # Password change form
│   │   │   ├── Prescription.jsx      # Prescription upload
│   │   │   ├── Accounts.jsx          # User profile management
│   │   ├── layout/
│   │   │   ├── General.jsx           # Auth layout wrapper
│   │   │   └── ClientDashboard.jsx   # User dashboard
│   │   └── components/
│   │       ├── Auth.jsx              # Shared auth form component
│   │       └── OtpPage.jsx           # OTP verification page
│   ├── admin/
│   │   ├── AdminLoginPage.jsx        # Admin login
│   │   ├── AdminLayout.jsx           # Admin dashboard layout
│   │   ├── AdminProductsPage.jsx     # Manage medicines
│   │   ├── AdminBatchPage.jsx        # Manage batches/inventory
│   │   ├── AdminOrdersPage.jsx       # View all orders
│   │   ├── AdminUsersPage.jsx        # Manage users
│   │   ├── ProductsTable.jsx         # Medicines data table
│   │   ├── ProductsTable.css
│   │   ├── ProductEditorModal.jsx    # Add/edit medicine form
│   │   ├── BatchTable.jsx            # Batches data table
│   │   ├── BatchEditorModal.jsx      # Add/edit batch form
│   │   ├── OrdersTable.jsx           # Orders data table
│   │   ├── OrderStatusModal.jsx      # Update order status
│   │   ├── UsersTable.jsx            # Users data table
│   │   ├── adminAuth.js              # Admin authentication helper
│   │   ├── adminApi.js               # Admin API integration
│   │   ├── batchApi.js               # Batch API integration
│   │   ├── analyticsSecction/
│   │   │   ├── Dashboard.jsx         # Analytics dashboard
│   │   │   ├── Reports.jsx           # Reports page
│   │   │   └── StatCard.jsx          # Statistics card component
│   │   ├── admin.css
│   │   ├── AdminLogin.css
│   │   └── batch.css
│   ├── delivery/
│   │   ├── AddressPage.jsx           # Address management page
│   │   ├── AddressForm.jsx           # Add/edit address form
│   │   └── AddressList.jsx           # List of saved addresses
│   ├── order/
│   │   ├── MyOrdersPage.jsx          # User's order history
│   │   └── OrderDetailsPage.jsx      # Order detail view
│   └── payment/
│       ├── MediCartModule4.jsx       # Payment module wrapper
│       ├── CheckoutPage.jsx          # Checkout/order summary
│       ├── CheckoutPage.css
│       ├── PaymentsPage.jsx          # Payment history
│       ├── PaymentsPage.css
│       ├── InvoicePage.jsx           # Invoice view
│       ├── InvoicePage.css
│       ├── PaymentSelect.jsx         # Payment method selection
│       ├── CardPayment.jsx           # Credit card form
│       ├── DebitCard.jsx             # Debit card form
│       ├── Theme.css
│       └── Theme.css
```

### Key Frontend Files

#### 1. **main.jsx** - React Entry Point
```jsx
import './styles/vars.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'
import App from './App.jsx'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "/src/store/store.js";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
```

#### 2. **App.jsx** - Route Configuration
Routes defined:
- `/` - Homepage (medicines catalog)
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/change-password`, `/auth/otp`
- `/address` - Delivery address management (protected)
- `/cart` - Shopping cart (protected)
- `/orders`, `/orders/:orderId` - Order history (protected)
- `/payment` - Payment processing (protected)
- `/dashboard_client/prescription`, `/dashboard_client/account` - User dashboard (protected)
- `/admin/login` - Admin login
- `/admin/products`, `/admin/batches`, `/admin/dashboard`, `/admin/reports`, `/admin/orders`, `/admin/users` - Admin panel

#### 3. **store/store.js** - Redux Configuration
```javascript
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/catalog/productSlice";
import cartReducer from "../components/cart/cartSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer
  },
});
```

#### 4. **api/client.js** - HTTP Client with JWT
- Axios instance with baseURL: `http://localhost:8080` (API Gateway)
- Request interceptor: Adds Bearer token and X-User-Id header
- Response interceptor: Handles 401 errors
- JWT extraction from token payload

#### 5. **styles/vars.css** - Design System
```css
:root {
  /* PRIMARY GREEN PALETTE */
  --color-primary-50: #e9f7ef;
  --color-primary-500: #2fbf5d;
  --color-primary-700: #21894b;
  
  /* TEXT COLORS */
  --text-default: #1b2b23;
  --text-muted: #6b726e;
  --text-error: #d32f2f;
  
  /* SPACING (rem-based) */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  
  /* Z-INDEX */
  --z-modal: 40;
  --z-toast: 50;
}
```

### API Services

#### **authService.js** - Authentication
```javascript
Methods:
- login(email, password) → LoginResponse with JWT token
- register(userData) → LoginResponse (with OTP verification step)
- getCurrentUser() → UserDTO
- updateProfile(userId, profileData) → UserDTO
- getAllUsers() → UserDTO[] (admin)
- deleteUser(userId) → void (admin)
- changePassword(oldPassword, newPassword) → Response
- forgotPassword(email) → Response
- resetPassword(token, newPassword) → Response
- logout() → void (clears localStorage)
```

#### **catalogService.js** - Medicines & Batches
```javascript
Methods:
- getMedicines(params) → MedicineDTO[]
- getMedicineById(id) → MedicineDTO
- createMedicine(data) → MedicineDTO (admin)
- updateMedicine(id, data) → MedicineDTO (admin)
- deleteMedicine(id) → void (admin)
- getBatches(params) → BatchDTO[]
- getBatchById(id) → BatchDTO
- createBatch(data) → BatchDTO (admin)
- updateBatch(id, data) → BatchDTO (admin)
- deleteBatch(id) → void (admin)
```

#### **orderService.js** - Orders, Cart, Addresses
```javascript
Cart Methods:
- getCart() → CartItemDTO[]
- addToCart(item) → CartItemDTO
- updateCartItem(itemId, quantity) → CartItemDTO
- removeFromCart(itemId) → void
- clearCart() → void
- getCartTotal() → number

Order Methods:
- placeOrder(addressId) → OrderDTO
- getMyOrders() → OrderDTO[]
- getOrderById(orderId) → OrderDTO
- getAllOrders(params) → OrderDTO[] (admin)
- updateOrderStatus(orderId, status) → OrderDTO (admin)
- cancelOrder(orderId) → void

Address Methods:
- getAddresses() → AddressDTO[]
- getAddressById(addressId) → AddressDTO
- createAddress(data) → AddressDTO
- updateAddress(addressId, data) → AddressDTO
- deleteAddress(addressId) → void
- setDefaultAddress(addressId) → AddressDTO
```

#### **paymentService.js** - Payments
```javascript
Methods:
- processPayment(orderId, amount, method) → PaymentResponse
- getPaymentStatus(paymentId) → PaymentDTO
- getPaymentByOrderId(orderId) → PaymentDTO
- getPaymentHistory() → PaymentDTO[]
- refundPayment(paymentId) → PaymentDTO
- getPaymentTransactions(paymentId) → TransactionDTO[]
```

#### **analyticsService.js** - Analytics & Reports
```javascript
Analytics Methods:
- getSummary() → AnalyticsSummaryDTO
- getRevenueTimeseries(days) → TimeSeriesData[]
- getOrdersTimeseries(days) → TimeSeriesData[]
- getTopProducts(limit) → ProductStatsDTO[]
- getDashboard() → DashboardDTO
- getSalesReport(params) → ReportDTO
- getInventoryReport() → ReportDTO
- subscribeToStream(onMessage, onError) → EventSource

Report Methods:
- getReports(params) → ReportDTO[]
- getReportById(reportId) → ReportDTO
- generateSalesReport(params) → ReportDTO
- generateInventoryReport(params) → ReportDTO
- generateComplianceReport(params) → ReportDTO
- exportReport(reportId, format) → Blob
- deleteReport(reportId) → void
```

### Key Features Implementation

#### **Shopping Cart (Redux)**
File: `components/cart/cartSlice.js`

State:
```javascript
{
  items: [
    {
      id: number,           // cart item ID
      product: MedicineDTO,
      qty: number
    }
  ],
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}
```

Thunks:
- `fetchCart()` - Sync cart from backend
- `addToCart(product)` - Add medicine
- `incrementQty(medicineId)` - Increase quantity
- `decrementQty(medicineId)` - Decrease or remove
- `clearCart()` - Empty cart after order

#### **Product Catalog (Redux)**
File: `features/catalog/productSlice.jsx`

State:
```javascript
{
  search: {
    q: string,                    // search query
    category: string              // filter category
  }
}
```

#### **Authentication Flow**
1. **User Registration**:
   - Enter email, password, name, phone
   - Backend sends OTP to email (mocked - shown in alert)
   - Navigate to OTP verification page
   - Verify OTP → Backend creates user, returns JWT
   - Auto-redirect to homepage or admin dashboard

2. **User Login**:
   - Enter email and password
   - Receive JWT token
   - Store token in localStorage
   - Redirect based on role (ADMIN vs USER)

3. **Protected Routes**:
   - `ProtectedRoute` component checks for token
   - If no token, redirect to `/auth/login`
   - Otherwise render child route (Outlet)

#### **Admin Authentication** (`adminAuth.js`)
```javascript
isAdminAuthenticated() → boolean
  - Checks: token exists AND userRole === "ROLE_ADMIN"

logoutAdmin() → void
  - Removes accessToken and userRole from localStorage
```

#### **Order Placement Flow**
1. User adds items to cart
2. Navigate to cart → verify items
3. Proceed to address selection
4. Select delivery address
5. Proceed to checkout
6. Confirm order → place order
7. Backend performs FIFO stock allocation
8. Process payment
9. Redirect to order details page

#### **FIFO Stock Allocation**
Backend handles this:
- When placing order, system queries batches ordered by `expiry_date ASC`
- Allocates stock from earliest expiring batch first
- Updates batch quantities
- Creates order items with batch references

---

## MICROSERVICES COMPLETE SOURCE

### Architecture Overview

```
┌─────────────────────────────────────────┐
│       API Gateway (8080)                │
│  - JWT Validation & Routing             │
└────────┬────────┬──────────┬────────────┘
         │        │          │
         ↓        ↓          ↓
    ┌────────┐ ┌──────────┐ ┌────────────┐
    │ Auth   │ │ Admin    │ │ Cart       │
    │(8081)  │ │Catalogue │ │Orders      │
    │        │ │(8082)    │ │(8083)      │
    └────────┘ └──────────┘ └────────────┘
         ↓          ↓            ↓
    auth_db   admin_db    cart_orders_db
```

### Service Descriptions

#### **1. Eureka Server (Port 8761)**
- Service registry and discovery
- Auto-registration of all microservices
- Health monitoring
- Dashboard: http://localhost:8761/

#### **2. API Gateway (Port 8080)**
Routes:
- `/auth/**` → Auth Service (8081)
- `/medicines/**` → Admin Catalogue (8082)
- `/batches/**` → Admin Catalogue (8082)
- `/api/cart/**` → Cart-Orders (8083)
- `/api/orders/**` → Cart-Orders (8083)
- `/api/address/**` → Cart-Orders (8083)
- `/api/analytics/**` → Analytics (8085)
- `/api/payment/**` → Payment (8086)

Features:
- JWT token validation
- Load balancing
- Request routing
- Circuit breaker pattern (optional)

#### **3. Auth Service (Port 8081)**

**Key Classes:**
- `AuthServiceApplication` - Main app class
- `AuthController` - REST endpoints
- `AuthService` - Business logic
- `User` - Entity with email, password, fullName, phone, role
- `Role` - Entity for role management
- `JwtService` - JWT token generation/validation
- `OtpService` - OTP generation/verification
- `UserRepository` - JPA repository for User
- `RoleRepository` - JPA repository for Role

**Database**: `auth_service_db`

**Tables**:
- `users` - User accounts with roles
- `roles` - Available roles (ROLE_ADMIN, ROLE_USER)
- `user_roles` - Many-to-many relationship

**Endpoints**:
```
POST /auth/register
  Input: { email, password, fullName, phone }
  Output: { token, tokenType, expiresIn, userId, roles }

POST /auth/login
  Input: { email, password }
  Output: { token, tokenType, expiresIn, userId, roles }

POST /auth/otp/send
  Input: { email }
  Output: { demoOtp } (for demo purposes)

POST /auth/otp/verify
  Input: { email, otp, fullName, phone, password }
  Output: { token, tokenType, userId, roles }

POST /auth/forgot-password
  Input: { email }
  Output: { message }

POST /auth/reset-password
  Input: { token, newPassword }
  Output: { message }

POST /auth/change-password
  Input: { oldPassword, newPassword }
  Output: { message }

GET /auth/validate
  Output: "Token is valid"

GET /auth/me
  Output: CurrentUserDTO

GET /auth/users
  Output: UserDTO[] (admin only)

DELETE /auth/users/{userId}
  Output: (admin only)
```

#### **4. Admin Catalogue Service (Port 8082)**

**Key Classes:**
- `AdminCatalogueServiceApplication` - Main app
- `MedicineController` - Medicine endpoints
- `BatchController` - Batch endpoints
- `Medicine` - Entity with name, category, price, sku, requiresRx
- `Batch` - Entity with batchNumber, expiryDate, quantity
- `MedicineRepository` - JPA repository
- `BatchRepository` - JPA repository
- `MedicineService` - Business logic
- `Prescription` - Prescription file entity
- `PrescriptionController` - Prescription endpoints

**Database**: `admin_catalogue_db`

**Tables**:
- `medicines` - Medicine catalog
- `batches` - Inventory batches with FIFO ordering by expiry date
- `prescriptions` - User prescriptions

**Endpoints**:
```
GET /medicines
  Params: page, size
  Output: MedicineDTO[]

GET /medicines/{id}
  Output: MedicineDTO

POST /medicines (admin)
  Input: MedicineDTO
  Output: MedicineDTO

PUT /medicines/{id} (admin)
  Input: MedicineDTO
  Output: MedicineDTO

DELETE /medicines/{id} (admin)
  Output: void

GET /batches
  Output: BatchDTO[]

GET /batches/{id}
  Output: BatchDTO

POST /batches (admin)
  Input: BatchDTO
  Output: BatchDTO

PUT /batches/{id} (admin)
  Input: BatchDTO
  Output: BatchDTO

DELETE /batches/{id} (admin)
  Output: void

GET /api/prescriptions
  Output: PrescriptionDTO[]

POST /api/prescriptions
  Input: FormData (multipart file)
  Output: PrescriptionDTO

GET /api/prescriptions/{id}/download
  Output: File (blob)
```

#### **5. Cart-Orders Service (Port 8083)**

**Key Classes:**
- `CartOrdersServiceApplication` - Main app
- `CartController` - Cart REST endpoints
- `OrderController` - Order REST endpoints
- `AddressController` - Address REST endpoints
- `CartService` - Cart business logic
- `OrderService` - Order business logic (FIFO allocation)
- `AddressService` - Address management
- `CartItem` - Entity for cart items
- `Order` - Entity for orders
- `OrderItem` - Entity for items in order
- `Address` - Entity for delivery addresses
- `MedicineClient` - Feign client to call Admin Catalogue
- `AuthClient` - Feign client to call Auth Service

**Database**: `cart_orders_db`

**Tables**:
- `cart_items` - User's shopping cart
- `addresses` - User delivery addresses
- `orders` - Orders placed
- `order_items` - Items in each order (references batch for FIFO tracking)

**Endpoints**:
```
POST /api/cart/add?medicineId={id}&quantity={qty}
  Header: X-User-Id
  Output: CartItemDTO

GET /api/cart
  Header: X-User-Id
  Output: CartItemDTO[]

PUT /api/cart/update/{itemId}?quantity={qty}
  Header: X-User-Id
  Output: CartItemDTO

DELETE /api/cart/remove/{itemId}
  Header: X-User-Id
  Output: void

GET /api/cart/total
  Header: X-User-Id
  Output: number

POST /api/cart/clear
  Header: X-User-Id
  Output: void

POST /api/orders/place?addressId={id}
  Header: X-User-Id
  Output: OrderDTO
  Logic: FIFO stock allocation from batches

GET /api/orders
  Header: X-User-Id
  Output: OrderDTO[]

GET /api/orders/{orderId}
  Header: X-User-Id
  Output: OrderDTO

PUT /api/orders/{orderId}/status?status={status}
  Header: X-User-Id
  Output: OrderDTO

POST /api/address
  Header: X-User-Id
  Input: AddressDTO
  Output: AddressDTO

GET /api/address
  Header: X-User-Id
  Output: AddressDTO[]

GET /api/address/{addressId}
  Header: X-User-Id
  Output: AddressDTO

PUT /api/address/{addressId}
  Header: X-User-Id
  Input: AddressDTO
  Output: AddressDTO

DELETE /api/address/{addressId}
  Header: X-User-Id
  Output: void
```

**FIFO Order Placement Algorithm**:
```java
public OrderDTO placeOrder(Long userId, Long addressId) {
  // 1. Get user's cart items
  List<CartItem> cartItems = getCartItems(userId);
  
  // 2. For each cart item, allocate stock from FIFO batches
  for (CartItem item : cartItems) {
    List<Batch> batches = batchRepository.findByMedicineId(item.medicineId)
      .stream()
      .sorted(Comparator.comparing(Batch::getExpiryDate))
      .collect(toList());
    
    int remainingQty = item.quantity;
    for (Batch batch : batches) {
      if (batch.getQuantityAvailable() >= remainingQty) {
        // Allocate all remaining from this batch
        batch.setQuantityAvailable(batch.getQuantityAvailable() - remainingQty);
        createOrderItem(order, item, batch, remainingQty);
        break;
      } else {
        // Allocate what's available and move to next batch
        int allocated = batch.getQuantityAvailable();
        createOrderItem(order, item, batch, allocated);
        remainingQty -= allocated;
        batch.setQuantityAvailable(0);
      }
    }
  }
  
  // 3. Save order and clear cart
  orderRepository.save(order);
  cartItemRepository.deleteByUserId(userId);
  
  return convertToDTO(order);
}
```

#### **6. Payment Service (Port 8086)**

**Key Classes:**
- `PaymentServiceApplication` - Main app
- `PaymentController` - Payment endpoints
- `PaymentService` - Payment business logic
- `Payment` - Entity for payments
- `Transaction` - Entity for transaction audit trail
- `PaymentRepository` - JPA repository
- `TransactionRepository` - JPA repository

**Database**: `payment_db`

**Tables**:
- `payments` - Payment records
- `transactions` - Transaction audit trail

**Endpoints**:
```
POST /api/payment/process?orderId={id}&amount={amount}&paymentMethod={method}
  Header: X-User-Id
  Output: { paymentId, status, amount, transactionId, message }

GET /api/payment/{paymentId}
  Output: Payment

GET /api/payment/order/{orderId}
  Output: Payment

GET /api/payment/user/history
  Header: X-User-Id
  Output: Payment[]

POST /api/payment/{paymentId}/refund
  Output: { paymentId, status, amount, message }

GET /api/payment/{paymentId}/transactions
  Output: Transaction[]
```

#### **7. Analytics Service (Port 8085)**

**Key Classes:**
- `AnalyticsServiceApplication` - Main app
- `AnalyticsController` - Analytics endpoints
- `ReportController` - Report endpoints
- `Dashboard` - DTO for dashboard data

**Endpoints**:
```
GET /api/analytics/summary
  Output: AnalyticsSummaryDTO

GET /api/analytics/revenue-timeseries?days={days}
  Output: TimeSeriesData[]

GET /api/analytics/orders-timeseries?days={days}
  Output: TimeSeriesData[]

GET /api/analytics/top-products?limit={limit}
  Output: ProductStatsDTO[]

GET /api/analytics/dashboard
  Output: DashboardDTO

GET /api/analytics/sales
  Output: ReportDTO

GET /api/analytics/inventory
  Output: ReportDTO

POST /api/reports/generate
  Output: ReportDTO

GET /api/reports
  Output: ReportDTO[]

GET /api/reports/{id}
  Output: ReportDTO

POST /api/reports/sales
  Output: ReportDTO

POST /api/reports/inventory
  Output: ReportDTO

GET /api/reports/{id}/export?format={format}
  Output: Blob

DELETE /api/reports/{id}
  Output: void
```

---

## MediCart Billing Module

**Location**: `medicart-billing/src/`

Separate React app for billing/payment processing.

**Key Files**:
- `App.jsx` - Main app
- `pages/BillingPage.jsx`
- `pages/PaymentPage.jsx`
- `pages/CheckoutPage.jsx`
- `pages/PaymentSelect.jsx`
- `pages/CardPayment.jsx`
- `pages/NetBanking.jsx`
- `pages/DebitCard.jsx`
- `pages/Success.jsx`
- `api/billingPaymentAPI.js`
- `data/mockInvoices.js`
- `components/ProgressBar.jsx`
- `components/PaymentOptions.jsx`
- `components/CartSummary.jsx`

---

## Database Schema & SQL

### Complete SQL Setup

See `microservices/db-setup.sql` for full schema with:

#### 1. Auth Service DB (`auth_service_db`)
**Tables**:
- `users` - User accounts
- `roles` - Role definitions
- `user_roles` - User-role mapping

#### 2. Admin Catalogue DB (`admin_catalogue_db`)
**Tables**:
- `medicines` - Medicine catalog
  - Columns: id, name, description, dosage, form, manufacturer, price, requires_prescription, status
- `batches` - Inventory batches
  - Columns: id, medicine_id, batch_number, quantity_available, quantity_total, manufacturing_date, expiry_date, cost_price, selling_price, status
  - Index: `medicine_id, expiry_date` (for FIFO ordering)
- `prescriptions` - User prescriptions

#### 3. Cart-Orders DB (`cart_orders_db`)
**Tables**:
- `cart_items` - Shopping cart
  - Columns: id, user_id, medicine_id, quantity, unit_price
  - Unique: (user_id, medicine_id)
- `addresses` - Delivery addresses
  - Columns: id, user_id, street_address, city, state, postal_code, country, phone, is_default
- `orders` - Orders
  - Columns: id, user_id, address_id, order_number, total_amount, status, order_date, delivery_date
- `order_items` - Items in orders
  - Columns: id, order_id, medicine_id, batch_id, quantity, unit_price, subtotal

#### 4. Analytics DB (`analytics_db`)
**Tables**:
- `sales_analytics` - Sales data
- `inventory_analytics` - Inventory levels
- `dashboard_metrics` - Dashboard KPIs

#### 5. Payment DB (`payment_db`)
**Tables**:
- `payments` - Payment records
  - Columns: id, order_id, user_id, amount, payment_status, payment_method, transaction_id
- `transactions` - Transaction audit trail

### Seed Data

Sample medicines, batches, users, roles provided in `db-setup.sql`

---

## Architecture Summary

### Technology Stack

**Frontend**:
- React 18
- Redux Toolkit
- React Query
- React Router v6
- Vite (build tool)
- TailwindCSS
- Bootstrap 5
- Axios

**Backend**:
- Java 21
- Spring Boot 3.x
- Spring Cloud (Eureka, Gateway, Feign)
- Spring Security (JWT)
- Spring Data JPA
- Spring Transaction Management
- Lombok

**Database**:
- MySQL 8.0
- 5 independent databases (1 per microservice + analytics)

**DevOps**:
- Docker & Docker Compose
- Maven

### Security Architecture

1. **JWT Authentication**:
   - Token generated on login/registration
   - Stored in localStorage
   - Passed in `Authorization: Bearer <token>` header
   - Validated by API Gateway and individual services

2. **Role-Based Access Control**:
   - `ROLE_USER` - Regular users
   - `ROLE_ADMIN` - Administrators
   - `@PreAuthorize("hasRole('ADMIN')")` on endpoints

3. **User Identification**:
   - `X-User-Id` header extracted from JWT
   - Used to isolate user data in queries

### Data Flow

**Example: Place Order**

1. **Frontend**:
   - Cart items in Redux state
   - User selected address
   - Click "Place Order"

2. **API Call**:
   - POST `/api/orders/place?addressId=123`
   - Header: `X-User-Id: 5`

3. **API Gateway** (8080):
   - Validates JWT token
   - Routes to Cart-Orders Service

4. **Cart-Orders Service** (8083):
   - Receives request with userId=5, addressId=123
   - Fetches user's cart items
   - For each medicine:
     - Calls Admin Catalogue via Feign: `GET /medicines/{id}`
     - Gets batches ordered by expiry date (FIFO)
     - Allocates stock from earliest batch first
   - Creates Order and OrderItems
   - Clears user's cart
   - Calls Payment Service to process payment

5. **Response**:
   - OrderDTO sent to frontend
   - Redux cart cleared
   - Navigate to order details page

### Performance Considerations

1. **Database**:
   - Indexes on frequently queried columns (user_id, medicine_id, expiry_date)
   - FIFO batch query uses indexed sorting

2. **API Gateway**:
   - Load balancing via Eureka
   - Request filtering and JWT validation

3. **Caching**:
   - React Query for frontend caching
   - Optional Redis for backend (future enhancement)

4. **Connection Pooling**:
   - HikariCP configured for optimal DB connections

### Deployment

**Local Development**:
```bash
# Start Eureka Server
cd microservices/eureka-server
mvn spring-boot:run

# Start API Gateway
cd microservices/api-gateway
mvn spring-boot:run

# Start all services in separate terminals
cd microservices/auth-service && mvn spring-boot:run
cd microservices/admin-catalogue-service && mvn spring-boot:run
cd microservices/cart-orders-service && mvn spring-boot:run
cd microservices/analytics-service && mvn spring-boot:run
cd microservices/payment-service && mvn spring-boot:run

# Start frontend
cd frontend && npm run dev
```

**Docker Deployment**:
```bash
cd microservices
docker-compose up -d
```

---

## Common DTOs (Data Transfer Objects)

Located in: `microservices/common/src/main/java/com/medicart/common/dto/`

- `LoginRequest` - Email & password
- `LoginResponse` - JWT token, roles, userId
- `RegisterRequest` - Email, password, fullName, phone
- `UserDTO` - User profile
- `MedicineDTO` - Medicine info
- `BatchDTO` - Batch info
- `CartItemDTO` - Cart item
- `OrderDTO` - Order summary
- `OrderItemDTO` - Item in order
- `AddressDTO` - Delivery address
- `PaymentDTO` - Payment info
- `ReportDTO` - Report data

---

## Error Handling

**Frontend**:
- Try-catch blocks in API calls
- Error messages displayed in UI
- 401 Unauthorized → redirect to login
- Network errors shown in alerts

**Backend**:
- `@ControllerAdvice` for centralized error handling
- HTTP status codes (400, 401, 404, 500)
- Error messages in JSON response: `{ "error": "message" }`

---

## Key Features Implemented

✅ User Authentication (Email/Password + OTP)
✅ Medicine Catalog with Search & Filter
✅ Shopping Cart with Persistent Sync
✅ FIFO Stock Allocation on Order
✅ Delivery Address Management
✅ Multiple Payment Methods
✅ Order History & Tracking
✅ Admin Dashboard & Analytics
✅ Inventory Management
✅ Prescription Upload
✅ Role-Based Access Control
✅ JWT Token Management
✅ Microservices Architecture
✅ Service Discovery (Eureka)
✅ API Gateway Routing
✅ Inter-Service Communication (Feign)

---

## File Statistics

| Category | Count | Location |
|----------|-------|----------|
| Frontend React Components | 50+ | frontend/src |
| Frontend CSS Files | 15+ | frontend/src/features, frontend/src/components |
| Frontend API Services | 5 | frontend/src/api |
| Java Microservices | 7 | microservices/ |
| Java Entity Classes | 20+ | microservices/*/src/main/java |
| Java Controllers | 15+ | microservices/*/src/main/java |
| Java Services | 10+ | microservices/*/src/main/java |
| Database Tables | 20+ | Across 5 databases |

---

**End of Document**

*This comprehensive summary provides complete documentation of the MediCart application's source code, architecture, and implementation details for archival and reference purposes.*

