# 🚀 MediCart — Project Setup Guide

## What You Need Installed (Prerequisites)

Before running this project, make sure you have these installed on your computer:

| Software | Version | Why? |
|---|---|---|
| **Java JDK** | 21 or later | Backend is written in Java |
| **Maven** | 3.9+ | Builds the Java projects |
| **MySQL** | 8.0 | Database for storing data |
| **Node.js** | 18+ | Runs the frontend |
| **npm** | 9+ | Installs frontend packages |
| **Git** | Any | Version control |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Vedansh15246/Medicart-FS.git
cd Medicart-FS
```

---

## Step 2: Set Up MySQL Databases

MediCart uses **4 separate MySQL databases** (one per service). You need to create them.

### Open MySQL Command Line

```bash
# Windows (if MySQL is in PATH)
mysql -u root -p

# Or use the full path on Windows
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Enter your password (default in project: `root`).

### Create the Databases

```sql
-- Create all 4 databases
CREATE DATABASE IF NOT EXISTS auth_service_db;
CREATE DATABASE IF NOT EXISTS admin_catalogue_db;
CREATE DATABASE IF NOT EXISTS cart_orders_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS analytics_db;

-- Verify they were created
SHOW DATABASES;
```

> **Note:** You don't need to create tables manually! Spring Boot with `spring.jpa.hibernate.ddl-auto=update` will automatically create all tables when the services start.

### If your MySQL password is NOT `root`

You need to update the password in each service's `application.properties` file:

```
microservices/auth-service/src/main/resources/application.properties
microservices/admin-catalogue-service/src/main/resources/application.properties
microservices/cart-orders-service/src/main/resources/application.properties
microservices/payment-service/src/main/resources/application.properties
microservices/analytics-service/src/main/resources/application.properties
```

Change this line in each file:
```properties
spring.datasource.password=root    ← Change 'root' to your password
```

---

## Step 3: Build the Backend (Microservices)

### Navigate to the microservices folder

```bash
cd "Project work/microservices"
```

### Build all services at once

```bash
# This builds the parent POM which builds ALL child services
mvn clean install -DskipTests
```

> **What does this do?**
> - `mvn` = Run Maven (the build tool)
> - `clean` = Delete old compiled files
> - `install` = Compile code, package into JAR files, install to local Maven repo
> - `-DskipTests` = Skip running tests (faster build)

This will build:
1. `common` (shared DTOs) — gets built first because other services depend on it
2. `eureka-server`
3. `api-gateway`
4. `auth-service`
5. `admin-catalogue-service`
6. `cart-orders-service`
7. `payment-service`
8. `analytics-service`

### Verify build succeeded

You should see:
```
[INFO] BUILD SUCCESS
```

If you see errors, common fixes:
- Make sure Java 21 is installed: `java -version`
- Make sure Maven is installed: `mvn -version`
- Make sure you're in the `microservices/` directory

---

## Step 4: Start the Backend Services

**⚠️ IMPORTANT: Start services in this exact order!** Eureka must be first, then Gateway, then other services.

### Terminal 1: Eureka Server (must start FIRST)

```bash
cd eureka-server
mvn spring-boot:run
```

Wait until you see:
```
Started EurekaServerApplication on port 8761
```

**Verify:** Open http://localhost:8761 in your browser. You should see the Eureka dashboard.

### Terminal 2: API Gateway

```bash
cd api-gateway
mvn spring-boot:run
```

Wait until you see:
```
Started ApiGatewayApplication on port 8080
```

### Terminal 3: Auth Service

```bash
cd auth-service
mvn spring-boot:run
```

Port: 8081. This will also create the default admin user:
- Email: `admin@medicart.com`
- Password: `admin123`

### Terminal 4: Admin Catalogue Service

```bash
cd admin-catalogue-service
mvn spring-boot:run
```

Port: 8082

### Terminal 5: Cart-Orders Service

```bash
cd cart-orders-service
mvn spring-boot:run
```

Port: 8083

### Terminal 6: Payment Service

```bash
cd payment-service
mvn spring-boot:run
```

Port: 8086

### Terminal 7: Analytics Service

```bash
cd analytics-service
mvn spring-boot:run
```

Port: 8085

### Quick Reference: All Ports

| Service | Port | URL |
|---|---|---|
| Eureka Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| Auth Service | 8081 | (accessed via gateway) |
| Admin Catalogue | 8082 | (accessed via gateway) |
| Cart-Orders | 8083 | (accessed via gateway) |
| Analytics | 8085 | (accessed via gateway) |
| Payment | 8086 | (accessed via gateway) |

---

## Step 5: Start the Frontend

### Open a new terminal

```bash
cd "Project work/frontend"
```

### Install dependencies

```bash
npm install
```

> This reads `package.json` and downloads all required packages into `node_modules/`.

### Start the development server

```bash
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Open in browser

Go to **http://localhost:5173** — you should see the MediCart home page!

---

## Step 6: Verify Everything Works

### Test 1: Homepage loads medicines
- Open http://localhost:5173
- You should see medicine cards (if any are in the database)
- If empty, that's OK — admin needs to add medicines first

### Test 2: Register a user
- Click "Sign Up" or go to http://localhost:5173/auth/register
- Fill in details and register
- You should be logged in after registration

### Test 3: Admin login
- Go to http://localhost:5173/admin/login
- Login with: `admin@medicart.com` / `admin123`
- You should see the admin panel

### Test 4: Check Eureka
- Go to http://localhost:8761
- Under "Instances currently registered with Eureka," you should see all services listed

---

## 🔧 Troubleshooting

### Problem: "Connection refused" on port 8080
**Cause:** API Gateway is not running.
**Fix:** Make sure all services are started in order (Eureka first).

### Problem: "Unknown user" when placing orders
**Cause:** Cart-Orders Service can't reach Auth Service.
**Fix:** Check that Auth Service is registered in Eureka (http://localhost:8761).

### Problem: MySQL connection error
**Cause:** MySQL is not running or wrong password.
**Fix:** 
1. Make sure MySQL is running
2. Check password in `application.properties`
3. Make sure databases exist (Step 2)

### Problem: Frontend shows blank page
**Cause:** Node modules not installed.
**Fix:** Run `npm install` in the `frontend/` folder.

### Problem: Port already in use
**Fix:** Kill the process using that port:
```bash
# Windows PowerShell
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Problem: Maven build fails with "common" dependency not found
**Fix:** Build the common module first:
```bash
cd microservices/common
mvn clean install
```
Then build the rest.

---

## 📝 Development Tips

### Hot Reload
- **Frontend:** Vite has hot module replacement (HMR). Save a file → browser updates instantly.
- **Backend:** You need to restart the service after code changes. (Use `spring-boot-devtools` for auto-restart if desired.)

### Checking Logs
Each service logs to the console. Look for:
- `✅` = Success
- `❌` = Error
- `⚠️` = Warning

### Database GUI
Use **MySQL Workbench** or **DBeaver** to visually browse your databases and tables.

### API Testing
Use **Postman** or **Thunder Client** (VS Code extension) to test API endpoints directly.

---

*Next: Read [02_AUTHENTICATION.md](./02_AUTHENTICATION.md) to understand the login system.*
