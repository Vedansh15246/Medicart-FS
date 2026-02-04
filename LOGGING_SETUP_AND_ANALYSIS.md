# Complete Logging Setup - Analysis Guide

## Comprehensive Logging Implemented ✅

### Backend Logging

**Two services now have file-based logging:**

1. **auth-service** (Port 8081)
   - Log file location: `microservices/auth-service/logs/auth-service.log`
   - Configuration: `logback-spring.xml`
   - Logs all authentication requests, responses, JWT validation
   - Prescription controller request/response details
   - Authorization header validation

2. **admin-catalogue-service** (Port 8082)
   - Log file location: `microservices/admin-catalogue-service/logs/admin-catalogue-service.log`
   - Configuration: `logback-spring.xml`
   - Logs all medicine fetch operations
   - Stock status calculation with batch details
   - Detailed logging of each batch's expiry date and quantity

---

### Frontend Logging

**Browser console + localStorage logging:**

1. **Logger Utility** (`frontend/src/utils/logger.js`)
   - Saves all logs to browser localStorage
   - Maximum 500 logs kept in storage
   - Can be exported/downloaded as text file

2. **API Client** (`frontend/src/api/client.js`)
   - Logs every HTTP request with method, URL, headers
   - Logs every HTTP response with status, data size
   - Logs errors with detailed status codes
   - Special logging for 403 Forbidden errors

3. **ProductCard Component** (`frontend/src/features/catalog/productCard.jsx`)
   - Logs product data received from API
   - Logs stock calculation logic
   - Shows which field is being used for stock status

4. **Prescription Component** (`frontend/src/features/auth/pages/Prescription.jsx`)
   - Logs prescription history load attempts
   - Logs file upload attempts with file details
   - Logs errors with full error data

---

## How to Read the Logs

### To Access Frontend Logs:

1. **Open Browser DevTools**: F12
2. **Console Tab**: See real-time logs
3. **Export logs to file**:
   ```javascript
   // In browser console, run:
   import logger from './utils/logger.js'
   logger.downloadLogs()
   ```

### To Access Backend Logs:

**auth-service logs:**
```powershell
Get-Content "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\auth-service\logs\auth-service.log" -Tail 50
```

**admin-catalogue logs:**
```powershell
Get-Content "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 50
```

---

## Expected Log Outputs

### 📋 For Prescription GET Request (Fixed ✅)

**Frontend Logs:**
```
🌐 API REQUEST - GET /api/prescriptions
  method: GET
  url: http://localhost:8080/api/prescriptions
  headers: {Authorization: "Bearer eyJ...", X-User-Id: "1"}

✅ API RESPONSE - GET /api/prescriptions
  status: 200
  dataSize: 2
```

**Backend Logs (auth-service):**
```
═══════════════════════════════════════════════════════════════
📋 GET /prescriptions REQUEST RECEIVED
  Path: /prescriptions
  X-User-Id Header: 1
  Authorization Header Present: true
  Auth Header Type: Bearer
═══════════════════════════════════════════════════════════════
✅ RESPONSE: Returning 0 prescriptions
```

---

### 📤 For Prescription POST Request (Upload)

**Frontend Logs:**
```
📤 Starting prescription upload
  fileName: test.pdf
  size: 1024

🌐 API REQUEST - POST /api/prescriptions
  method: POST
  url: http://localhost:8080/api/prescriptions
  headers: {Authorization: "Bearer eyJ...", X-User-Id: "1"}

✅ Prescription uploaded successfully
  fileName: test.pdf
```

**Backend Logs (auth-service):**
```
═══════════════════════════════════════════════════════════════
📤 POST /prescriptions REQUEST RECEIVED
  Path: /prescriptions
  Method: POST
  Content-Type: multipart/form-data; boundary=...
  X-User-Id Header: 1
  Authorization Header Present: true
  File Name: test.pdf
  File Size: 1024 bytes
═══════════════════════════════════════════════════════════════
✅ RESPONSE: File uploaded successfully - userId: 1
```

---

### 📦 For Product Stock Status

**Frontend Logs (ProductCard):**
```
📦 ProductCard received product
  id: 1
  name: Paracetamol
  stockStatus: IN_STOCK
  inStock: true
  totalQuantity: 100
  batches: 3

📊 ProductCard stock calculation
  productId: 1
  stockStatus: IN_STOCK
  isInStock: true
  hasQuantity: true
  totalQuantity: 100
  canBuy: true
```

**Backend Logs (admin-catalogue):**
```
📊 Calculating stock status for medicineId: 1
  Found 3 batches for medicineId: 1
  Today's date: 2026-02-01
    - Batch: 1, Expiry: 2026-06-01, Qty: 50
    - Batch: 2, Expiry: 2026-05-15, Qty: 30
    - Batch: 3, Expiry: 2026-04-10, Qty: 20
  Has unexpired batch: true
  ✅ UNEXPIRED BATCH EXISTS - Returning IN_STOCK
```

---

### 🔴 If Still Getting 403 Forbidden

**Frontend Logs Will Show:**
```
❌ API ERROR - POST /api/prescriptions
  status: 403
  error: "Request failed with status code 403"

❌ Access Forbidden - 403
  url: http://localhost:8080/api/prescriptions
  headers: {Authorization: "Bearer eyJ...", X-User-Id: "1"}
  status: 403
```

**Backend Logs Will Show:**
```
❌ JWT VALIDATION FAILED - /prescriptions: Token expired
```
or
```
❌ JWT VALIDATION FAILED - /prescriptions: Signature verification failed
```

This tells us exactly what JWT validation failed.

---

## Step-by-Step Diagnosis

### For "OUT_OF_STOCK" Issue:

1. **Check ProductCard logs**: 
   - Does `stockStatus` field exist in API response?
   - What is the value? (IN_STOCK, OUT_OF_STOCK, EXPIRED)
   - Is `totalQuantity` > 0?

2. **Check MedicineService logs**:
   - Are batches being found for the medicine?
   - What are batch expiry dates?
   - Is any batch unexpired?

3. **Compare**:
   - If backend shows "EXPIRED" but frontend shows "IN_STOCK" → JSON parsing issue
   - If backend shows "IN_STOCK" but frontend shows "OUT_OF_STOCK" → Frontend logic issue

### For "403 Forbidden" Issue:

1. **Check frontend logs**:
   - Is Authorization header being sent?
   - Is X-User-Id header being sent?
   - What values are they?

2. **Check backend JWT filter logs**:
   - Is token being received?
   - Is JWT validation failing? Why?
   - What's the exact error message?

3. **Check PrescriptionController logs**:
   - Are headers being received?
   - Is the method being called?
   - What response is being returned?

---

## Services to Start (in order):

```powershell
# 1. Stop all
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

# 2. Start Eureka
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\eureka-server"
java -jar target/eureka-server-1.0.0.jar

# 3. Start auth-service (NEW JAR with logging)
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\auth-service"
java -jar target/auth-service-1.0.0.jar

# 4. Start admin-catalogue (NEW JAR with logging)
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service"
java -jar target/admin-catalogue-service-1.0.0.jar

# 5. Start API Gateway
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\api-gateway"
java -jar target/api-gateway-1.0.0.jar

# 6. Start frontend
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\frontend"
npm run dev
```

---

## Files Updated

### Backend:
1. ✅ `microservices/auth-service/src/main/resources/logback-spring.xml` - Created
2. ✅ `microservices/auth-service/src/main/java/.../PrescriptionController.java` - Enhanced logging
3. ✅ `microservices/auth-service/src/main/java/.../JwtAuthenticationFilter.java` - Added logging
4. ✅ `microservices/admin-catalogue-service/src/main/resources/logback-spring.xml` - Created
5. ✅ `microservices/admin-catalogue-service/src/main/java/.../MedicineService.java` - Enhanced logging

### Frontend:
1. ✅ `frontend/src/utils/logger.js` - Created comprehensive logger
2. ✅ `frontend/src/api/client.js` - Integrated logging
3. ✅ `frontend/src/features/catalog/productCard.jsx` - Added product data logging
4. ✅ `frontend/src/features/auth/pages/Prescription.jsx` - Added request logging

### Build Status:
- ✅ auth-service: BUILD SUCCESS (6.384 seconds)
- ✅ admin-catalogue-service: BUILD SUCCESS (5.948 seconds)

---

## Next Steps

1. **Start all services** with commands above
2. **Perform a test**:
   - Load homepage to see product stock status
   - Try to upload a prescription
   - Try to load prescription history

3. **Check logs in this order**:
   - Frontend: Browser F12 console → export logs
   - Backend: PowerShell → Get-Content logs/xxx.log
   - Compare what's sent vs what's received

4. **Share logs** if issues persist - the logs will show exactly what's happening

Once you run the services and perform the test, share the logs and I'll fix the remaining issues immediately!
