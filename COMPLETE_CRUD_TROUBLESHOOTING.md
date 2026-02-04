# CRUD TROUBLESHOOTING & SETUP GUIDE

## Current Status: Everything is CORRECTLY configured ✅

Your code has:
- ✅ Proper JWT token handling in client.js
- ✅ Correct API endpoints and HTTP methods
- ✅ Proper security config with ADMIN role checks
- ✅ Complete CRUD operations in both frontend and backend
- ✅ Proper error handling in modals
- ✅ Data refetching after mutations

---

## DEBUGGING CHECKLIST

### 1. Verify Auth Token is Being Sent

**Check Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Make a POST request (e.g., create batch)
4. Click on the request
5. Go to Request Headers
6. Look for: `Authorization: Bearer eyJ...`

**If Authorization header is missing:**
```javascript
// Check in client.js - token retrieval
const token = localStorage.getItem("accessToken");
console.log("Token from localStorage:", token);

// Should output: Bearer eyJ0eXAi...
```

---

### 2. Verify Token Contains ROLE_ADMIN

**In browser console, paste this:**
```javascript
// Decode JWT and check role
const token = localStorage.getItem("accessToken");
const parts = token.replace("Bearer ", "").split('.');
const decoded = JSON.parse(atob(parts[1]));
console.log("Token payload:", decoded);
console.log("Role/Scope:", decoded.scope || decoded.authorities);

// Should show: "ROLE_ADMIN"
```

---

### 3. Verify Admin-Catalogue Service is Running

**In terminal:**
```bash
# Check if port 8082 is listening
netstat -ano | findstr :8082

# Or in PowerShell:
Get-NetTCPConnection -LocalPort 8082
```

**Expected output:**
```
TCP    127.0.0.1:8082    LISTENING    (AdminCatalogueServiceApplication)
```

---

### 4. Check API Gateway Routes Requests Correctly

**Test with curl or Postman:**
```bash
# Get medicines (public - no auth needed)
curl http://localhost:8080/medicines

# Should return JSON array of medicines
```

---

### 5. Monitor Service Logs

**Look for these messages in AdminCatalogueServiceApplication console:**

When service starts:
```
Tomcat started on port 8082
Registering application ADMIN-CATALOGUE-SERVICE with eureka with status UP
```

When CRUD request comes in:
```
# You should see the request being processed
# If there's an error, it will be logged
```

---

## Common Issues & Solutions

### Issue: "403 Forbidden" when creating batch

**Cause:** Token doesn't have ROLE_ADMIN

**Solution:**
1. Login again as ADMIN user
2. Verify token has `"scope": "ROLE_ADMIN"` (see step 2 above)
3. Check user has ADMIN role in database:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 1;
   -- Should show role_id = 1 (ROLE_ADMIN)
   ```

---

### Issue: "Cannot read properties of undefined"

**Cause:** medicines list is empty/undefined when rendering dropdown

**Check in BatchEditorModal:**
```javascript
// This line should handle undefined:
const medicineList = Array.isArray(medicines) ? medicines : [];

// If medicines is still undefined:
console.log("Medicines in modal:", medicines);
```

**Solution:**
```javascript
// Ensure AdminBatchPage passes medicines correctly
const { data: medicines = [] } = useQuery({
  queryKey: ["medicines"],
  queryFn: fetchMedicines,
});
```

---

### Issue: Data not persisting after refresh

**Cause:** Database not being written to

**Check:**
1. Verify migration script ran:
   ```sql
   USE admin_catalogue_db;
   DESCRIBE batches;
   -- Should show quantity_total column
   ```

2. Check database logs for INSERT errors

3. Verify service is using correct database credentials

---

### Issue: Modal doesn't close after saving

**Cause:** onSaved() or onClose() not called

**Check in BatchEditorModal:**
```javascript
try {
  // API call
  await createBatch(payload);
  
  onSaved();      // ← This reloads data
  onClose();      // ← This closes modal
} catch (error) {
  console.error("Error:", error);
  // Modal should still close!
}
```

---

## Step-by-Step Testing Procedure

### Phase 1: Environment Check
```bash
# 1. Verify all services running
# Check terminals for:
# ✅ Eureka Server running
# ✅ API Gateway running
# ✅ Admin Catalogue Service running on :8082
# ✅ Auth Service running (for token validation)

# 2. Database check
mysql -u root -p
USE admin_catalogue_db;
DESCRIBE batches;          -- Check schema
SELECT COUNT(*) FROM medicines;  -- Should have items
```

### Phase 2: Authentication
```bash
# 1. Login as admin
Frontend: Login with admin@medicart.com
Check console: localStorage.getItem("accessToken")

# 2. Verify token
Paste in console:
const token = localStorage.getItem("accessToken");
const parts = token.replace("Bearer ", "").split('.');
const decoded = JSON.parse(atob(parts[1]));
console.log(decoded.scope);  // Should show ROLE_ADMIN
```

### Phase 3: Test GET (Public)
```javascript
// In console:
fetch('http://localhost:8080/batches')
  .then(r => r.json())
  .then(data => console.log("Batches:", data));

// Should work WITHOUT Authorization header
// Should return array of batches
```

### Phase 4: Test POST (Requires ADMIN)
```javascript
// In console:
const token = localStorage.getItem("accessToken");
fetch('http://localhost:8080/batches', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    medicineId: 1,
    batchNo: 'TEST-001',
    expiryDate: '2025-12-31',
    qtyAvailable: 100
  })
})
.then(r => r.json())
.then(data => console.log("Created:", data));

// Should return 201 Created
// If 403: token doesn't have ROLE_ADMIN
```

### Phase 5: Test UI
```
1. Admin → Batch Management
2. Click "+ Add Batch"
3. Select medicine from dropdown
4. Fill in all fields
5. Click "Save Batch"
6. Check:
   - Modal closes
   - Batch appears in table
   - Refresh page - batch still exists
```

---

## Network Debugging

### Enable Request Logging

**In client.js:**
```javascript
// Add after interceptor setup
client.interceptors.response.use(
  response => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### Use Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Set filter to XHR
4. Try to create batch
5. Click on the POST request
6. Check:
   - Status: Should be 201 (or 200 for response)
   - Headers: Look for Authorization
   - Response: Should have batch data
   - Payload: Should have correct data

---

## Expected Response Formats

### Successful Batch Create
```json
{
  "id": 5,
  "medicineId": 1,
  "medicineName": "Aspirin",
  "batchNo": "TEST-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}
```

### Successful Batch Update
```json
{
  "id": 5,
  "medicineId": 1,
  "medicineName": "Aspirin",
  "batchNo": "TEST-001-UPDATED",
  "expiryDate": "2026-01-31",
  "qtyAvailable": 150
}
```

### Error: 403 Forbidden
```json
{
  "error": "Access Denied",
  "message": "User does not have required role: ROLE_ADMIN"
}
```

### Error: 400 Bad Request (Invalid Data)
```json
{
  "error": "Bad Request",
  "message": "medicineId must not be null"
}
```

---

## Performance Monitoring

### Check for Memory Leaks
```javascript
// In ProductsTable/BatchTable
// Make sure useEffect cleanup is proper
useEffect(() => {
  return () => {
    // Cleanup if needed
  };
}, [dependency]);
```

### Check for Unnecessary Re-renders
```javascript
// If component re-renders too often, add React.memo
export default React.memo(BatchTable);
```

### Check Query Caching
```javascript
// @tanstack/react-query caches by queryKey
// Verify keys are consistent:
queryKey: ["batches"]  // ← Used in AdminBatchPage
// When refetch is called, it invalidates this key
```

---

## Database Verification Queries

```sql
-- Check medicines exist
USE admin_catalogue_db;
SELECT COUNT(*) FROM medicines;
SELECT * FROM medicines LIMIT 3;

-- Check batches structure
DESCRIBE batches;
-- Should show: quantity_total INT

-- Check batch-medicine relationship
SELECT b.id, b.batch_number, b.quantity_available, 
       b.quantity_total, m.name
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
LIMIT 5;

-- Check recent inserts
SELECT * FROM batches ORDER BY created_at DESC LIMIT 5;
```

---

## Log Locations

**Application Logs:**
- Admin Catalogue Service: Terminal window where service is running
- Auth Service: Terminal window
- API Gateway: Terminal window

**Database Logs:**
```bash
# MySQL error log location (Windows)
C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err

# Check in MySQL:
SHOW VARIABLES LIKE 'log_error';
```

---

## Verification Checklist

Before testing CRUD operations, verify:

- [ ] All 3 microservices running (Eureka, API Gateway, Admin Catalogue)
- [ ] Frontend is loaded at http://localhost:5173
- [ ] Logged in as ADMIN user
- [ ] Token contains ROLE_ADMIN
- [ ] Database migration script has been run
- [ ] Admin Catalogue Service logs show no errors
- [ ] Browser console shows no errors when loading admin page
- [ ] Network tab shows successful GET /batches (200)

---

## Quick Start Commands

```bash
# Terminal 1: Start all services
cd c:\Users\SHAHID\OneDrive\Desktop\Project\microservices
mvn clean install
# Then run: Eureka, API Gateway, Admin Catalogue from VS Code

# Terminal 2: Start frontend
cd c:\Users\SHAHID\OneDrive\Desktop\Project\frontend
npm run dev

# Terminal 3: Run database migration if needed
mysql -u root -p admin_catalogue_db < MIGRATION_FIX_BATCHES.sql

# Test in browser:
http://localhost:5173
# Login → Admin → Batch Management
```

---

## Success Indicators

✅ When everything works, you will see:
1. Medicines dropdown populated in batch form
2. Batch creation succeeds with no errors
3. New batch appears in table immediately
4. Page refresh still shows the batch
5. Edit and delete buttons work
6. No console errors
7. Network tab shows 201 Created for POST requests
8. Network tab shows 200 OK for GET requests

---

**If still having issues:**
1. Check all items in verification checklist
2. Review browser console for error messages
3. Check Network tab for failed requests
4. Monitor service logs for exceptions
5. Verify token has correct format and role
6. Run database migration script again
7. Do a clean Maven build: `mvn clean install`

---

**Last Updated:** 2026-02-01  
**Status:** ✅ Complete flow documented
