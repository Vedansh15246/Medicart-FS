# Complete Service Restart & Verification Checklist

## ✅ All Changes Compiled Successfully

- ✅ auth-service: BUILD SUCCESS (6.827 seconds)
- ✅ api-gateway: BUILD SUCCESS (5.036 seconds)  
- ✅ admin-catalogue-service: BUILD SUCCESS (from previous session)

## 📋 Pre-Startup Checklist

Before restarting services:

- [ ] Verify MySQL is running and accessible
- [ ] Verify Eureka server can start (port 8761)
- [ ] Check no Java processes are using ports 8080, 8081, 8082

**To check/stop Java processes**:
```powershell
Stop-Process -Name java -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
```

## 🚀 Service Startup Order

Start in this order:

### 1. MySQL Database
```bash
# Should already be running
# Verify: mysql -h localhost -u root -p"shahid"
# Database: admin_catalogue_db should exist
```

### 2. Eureka Server
```powershell
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\eureka-server"
java -jar target/eureka-server-1.0.0.jar
# Wait for: "Started EurekaServerApplication"
# Port: 8761
```

### 3. Auth Service (Port 8081)
```powershell
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\auth-service"
java -jar target/auth-service-1.0.0.jar
# Watch logs for successful startup
# Port: 8081
```

### 4. Admin Catalogue Service (Port 8082)
```powershell
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service"
java -jar target/admin-catalogue-service-1.0.0.jar
# Watch logs for successful startup
# Port: 8082
```

### 5. API Gateway (Port 8080)
```powershell
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\api-gateway"
java -jar target/api-gateway-1.0.0.jar
# Watch logs for successful startup
# Port: 8080 - This is your main entry point
```

### 6. Frontend (Port 5173)
```powershell
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\frontend"
npm run dev
```

## 🧪 Service Health Checks

After all services start, verify they're working:

### Eureka Status
```
http://localhost:8761/eureka/web
```
Should show:
- auth-service registered
- admin-catalogue-service registered
- api-gateway registered

### API Gateway Health
```
http://localhost:8080/auth/health
```
Expected: `"Auth Service is running on port 8081"`

### Auth Service Health
```
http://localhost:8081/auth/health
```
Expected: `"Auth Service is running on port 8081"`

## 🔐 Authentication Flow Test

### Test 1: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicart.com",
    "password": "Admin@123"
  }'
```

Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": 1,
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "roles": ["ROLE_ADMIN"]
}
```

**Save the token value** - you'll need it for other tests

### Test 2: Get Current User Profile
```bash
# Replace TOKEN with value from Test 1
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer TOKEN" \
  -H "X-User-Id: 1"
```

Expected Response:
```json
{
  "id": 1,
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "phone": "+1-800-1234",
  "isActive": true,
  "role": "ROLE_ADMIN"
}
```

### Test 3: Update User Profile (THE FIX!)
```bash
# Replace TOKEN with value from Test 1
curl -X PUT http://localhost:8080/auth/users/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "X-User-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Admin Name",
    "phone": "9876543210"
  }'
```

Expected Response:
```json
{
  "message": "Profile updated successfully",
  "user": "Updated Admin Name"
}
```

✅ **If you get 200 OK (not 403), the PUT fix is working!**

### Test 4: Get Prescriptions (THE FIX!)
```bash
# Replace TOKEN with value from Test 1
curl -X GET http://localhost:8080/api/prescriptions \
  -H "Authorization: Bearer TOKEN" \
  -H "X-User-Id: 1"
```

Expected Response:
```json
[]
```
(Empty array, which is correct - no prescriptions uploaded yet)

✅ **If you get 200 OK (not 404), the prescriptions routing is working!**

### Test 5: Get Medicines (Stock Status)
```bash
curl -X GET http://localhost:8080/medicines
```

Expected: Medicines with correct stockStatus:
- `"IN_STOCK"` - if at least one unexpired batch
- `"OUT_OF_STOCK"` - if no batches
- `"EXPIRED"` - if all batches are expired

✅ **If stockStatus is calculated correctly, the previous fix is working!**

## 📊 Expected Log Output Examples

### Login Success Logs
```
🔐 LOGIN ATTEMPT
📧 Email received: admin@medicart.com
🔑 Password length: 9
✅ User found: admin@medicart.com
🟢 isActive = true
🎭 Role = ROLE_ADMIN
🔍 Password matches? true
✅ PASSWORD OK — GENERATING TOKEN
✅ JWT Token generated successfully for userId: 1
✅ LOGIN SUCCESSFUL for email: admin@medicart.com
👤 User ID: 1
🎭 Roles: [ROLE_ADMIN]
```

### Profile Update Logs
```
✏️ Update user profile attempt for userId: 1
   Requesting user ID: 1
✅ User profile updated successfully for userId: 1
```

### Prescription Fetch Logs
```
📋 Fetching prescription history for userId: 1
✅ Prescription history retrieved - count: 0
```

## ❌ Troubleshooting

### Issue: 403 Forbidden on PUT /auth/users/{id}
**Solution**: Make sure:
1. You're using the correct user ID (matches X-User-Id header)
2. Token is valid and not expired
3. API Gateway has restarted with new config

### Issue: 404 on GET /api/prescriptions
**Solution**: Make sure:
1. API Gateway is running (port 8080)
2. Auth service is running (port 8081)
3. API Gateway has new routes configured (check application.properties)

### Issue: 403 on GET /auth/me
**Solution**: Make sure:
1. Token is included in Authorization header
2. X-User-Id header is included
3. SecurityConfig allows GET on /auth/me

### Issue: Logs not showing
**Solution**: 
1. Check if SLF4J is properly configured
2. Look in console output (not separate log file)
3. Rebuild service if you modified logging code

## ✅ Final Verification Checklist

After all tests pass, confirm:

- [ ] PUT /auth/users/{id} returns 200 (not 403)
- [ ] GET /api/prescriptions returns 200 (not 404)
- [ ] GET /auth/me returns 200 (not 403)
- [ ] Stock status calculated correctly (IN_STOCK, OUT_OF_STOCK, or EXPIRED)
- [ ] Logs show detailed authorization flow
- [ ] Frontend can:
  - [ ] Login successfully
  - [ ] View user profile
  - [ ] Edit user profile
  - [ ] View prescriptions (empty list is fine)
  - [ ] View products with correct stock status

## 📝 Notes

- All rebuilt JARs are in target/ directories
- No database migrations needed (tables already exist)
- Default admin user: admin@medicart.com / Admin@123
- Ports used: 5173 (frontend), 8080 (gateway), 8081 (auth), 8082 (catalogue)
- Eureka: http://localhost:8761/eureka/web

## 🎉 Success Criteria

**All fixes working if**:
1. User can login with valid credentials
2. User can view their profile
3. User can update their profile (PUT returns 200, not 403)
4. User can view prescriptions (GET returns 200, not 404)
5. Products show correct stock status based on batches
6. Logs show detailed flow of operations

**If all 5 criteria pass, you're done! ✅**
