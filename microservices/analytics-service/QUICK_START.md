# Analytics Service - Quick Start Guide 🚀

## Prerequisites
- MySQL 8.0.33 running on localhost:3306
- Database `analytics_db` created
- Eureka Server running on localhost:8761
- Other services (auth-service, cart-orders-service, admin-catalogue-service) running

## Step 1: Verify Database
```sql
-- Connect to MySQL
mysql -u root -p

-- Verify database exists
SHOW DATABASES LIKE 'analytics_db';

-- Verify tables exist
USE analytics_db;
SHOW TABLES;
-- Should show: user_registrations, revenue_details, order_statistics, 
--              top_products, sales_by_category, order_status_distribution, reports
```

## Step 2: Start Analytics Service
```bash
cd "c:\Users\2460680\OneDrive - Cognizant\Documents\END\Medicart-FS\microservices\analytics-service"

# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Build JAR first, then run
mvn clean package -DskipTests
java -jar target/analytics-service-1.0.0.jar
```

## Step 3: Verify Service Registration
Open browser and go to: http://localhost:8761

You should see `ANALYTICS-SERVICE` in the "Instances currently registered with Eureka" section.

## Step 4: Initialize Analytics Data
The analytics service needs to fetch initial data from other services.

```bash
# Using curl (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/refresh" -Method POST

# Using curl (if installed)
curl -X POST http://localhost:8080/api/admin/analytics/refresh
```

Expected response:
```json
{
  "message": "Analytics refreshed successfully"
}
```

## Step 5: Test Analytics Endpoints

### Get Analytics Summary
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/summary" | ConvertTo-Json
```

Expected response structure:
```json
{
  "totalUsers": 1250,
  "usersToday": 42,
  "usersThisWeek": 178,
  "usersThisMonth": 625,
  "usersThisYear": 1250,
  "totalRevenue": 125000.0,
  "revenueToday": 4166.67,
  "revenueThisWeek": 31250.0,
  "revenueThisMonth": 62500.0,
  "revenueThisYear": 125000.0,
  "totalOrders": 450,
  "ordersToday": 15,
  "ordersThisWeek": 112,
  "ordersThisMonth": 225,
  "ordersThisYear": 450,
  "avgOrderValue": 277.78,
  "computedAt": "2024-02-13T16:30:00"
}
```

### Get Top Products
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/top-products?limit=6" | ConvertTo-Json
```

### Get Sales By Category
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/sales-by-category" | ConvertTo-Json
```

### Get Order Status Distribution
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/order-status-distribution" | ConvertTo-Json
```

## Step 6: Test Report Endpoints

### List All Reports
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/list" | ConvertTo-Json
```

### Generate Sales Report
```bash
$startDate = "2024-01-01"
$endDate = "2024-12-31"
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/sales?startDate=$startDate&endDate=$endDate" | ConvertTo-Json
```

### Generate Inventory Report
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/inventory" | ConvertTo-Json
```

### Generate User Activity Report
```bash
$startDate = "2024-01-01"
$endDate = "2024-12-31"
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/user-activity?startDate=$startDate&endDate=$endDate" | ConvertTo-Json
```

## Troubleshooting

### Problem: Service won't start
**Check:**
1. Port 8084 is not already in use: `netstat -ano | findstr :8084`
2. MySQL is running: `mysql -u root -p -e "SELECT 1"`
3. Database exists: `mysql -u root -p -e "USE analytics_db"`
4. Eureka Server is running: http://localhost:8761

### Problem: Feign client errors
**Error:** `com.netflix.client.ClientException: Load balancer does not have available server for client: auth-service`

**Solution:** Ensure all dependent services are registered with Eureka:
- auth-service
- cart-orders-service
- admin-catalogue-service

Check Eureka dashboard: http://localhost:8761

### Problem: Empty analytics data
**Error:** All counts are 0 or null

**Solution:** Call the refresh endpoint:
```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/refresh" -Method POST
```

### Problem: Database connection errors
**Error:** `Communications link failure`

**Solution:** 
1. Verify MySQL is running
2. Check credentials in `application.properties`:
   - Username: root
   - Password: Rohin
   - URL: jdbc:mysql://localhost:3306/analytics_db

3. Test connection:
```bash
mysql -u root -pRohin -e "USE analytics_db; SELECT 1"
```

## Logs Location
```
microservices/logs/analytics-service.log
```

View logs:
```bash
# View last 50 lines
Get-Content "c:\Users\2460680\OneDrive - Cognizant\Documents\END\Medicart-FS\microservices\logs\analytics-service.log" -Tail 50

# Follow logs in real-time
Get-Content "c:\Users\2460680\OneDrive - Cognizant\Documents\END\Medicart-FS\microservices\logs\analytics-service.log" -Wait -Tail 20
```

## Service Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/analytics/summary` | GET | Get complete analytics summary |
| `/api/admin/analytics/top-products?limit=6` | GET | Get top N products |
| `/api/admin/analytics/sales-by-category` | GET | Get sales by category |
| `/api/admin/analytics/order-status-distribution` | GET | Get order status breakdown |
| `/api/admin/analytics/refresh` | POST | Refresh analytics data |
| `/api/admin/reports/list` | GET | List all reports |
| `/api/admin/reports/sales?startDate=&endDate=` | GET | Generate sales report |
| `/api/admin/reports/inventory` | GET | Generate inventory report |
| `/api/admin/reports/user-activity?startDate=&endDate=` | GET | Generate user activity report |

## API Gateway Routes
All requests go through API Gateway at `localhost:8080`, which routes to analytics-service on `localhost:8084`.

Gateway automatically adds service discovery and load balancing.

## Development Tips

### Hot Reload
To enable hot reload during development:
```bash
mvn spring-boot:run -Dspring-boot.run.fork=false
```

### Debug Mode
To run in debug mode:
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```
Then attach your IDE debugger to port 5005.

### Testing Without Frontend
Use the provided curl/Invoke-RestMethod commands above to test all endpoints independently.

## Frontend Integration
Once the analytics service is running and verified, the frontend at `http://localhost:5173/admin/dashboard` will automatically call these endpoints through the API Gateway.

Make sure the frontend's `analyticsService.js` is configured to use:
- Base URL: `http://localhost:8080`
- All endpoints match the table above

---

**Need Help?**
Check the logs for detailed error messages with emoji prefixes:
- 📊 = Analytics operation
- ✅ = Success
- ❌ = Error
- 🔄 = Refresh operation
- 🔐 = Auth operation
