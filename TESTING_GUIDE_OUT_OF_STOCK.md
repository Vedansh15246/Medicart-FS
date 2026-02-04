# Quick Test Guide - OUT_OF_STOCK Fix

## 🚀 Quick Start

### 1. Build Status
- ✅ admin-catalogue-service: BUILD SUCCESS (2026-02-01T22:45:15+05:30)
- ✅ JAR file: `microservices/admin-catalogue-service/target/admin-catalogue-service-1.0.0.jar`

### 2. Changes Made
- ✅ productCard.jsx: Fixed stock determination logic
- ✅ Removed check for non-existent `product.batches` array
- ✅ Now uses only fields returned by API: `stockStatus` and `totalQuantity`

---

## 🧪 How to Test

### Start Services
```powershell
# Terminal 1 - Stop old processes first
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

# Wait 2 seconds
Start-Sleep -Seconds 2

# Terminal 1 - Start auth-service (Port 8081)
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\auth-service"
java -jar target/auth-service-1.0.0.jar

# Terminal 2 - Start admin-catalogue-service (Port 8082) 
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service"
java -jar target/admin-catalogue-service-1.0.0.jar

# Terminal 3 - Start API Gateway (Port 8080)
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\api-gateway"
java -jar target/api-gateway-1.0.0.jar

# Terminal 4 - Start Frontend (Port 5173)
cd "c:\Users\SHAHID\OneDrive\Desktop\Project\frontend"
npm run dev
```

### Test 1: Homepage Display
**What to do:**
1. Open browser: http://localhost:5173
2. Look at products displayed
3. Check if they show "Buy Now" button or "OUT OF STOCK" label

**What to check:**
```
✅ Products with stock → Show "Buy Now" button
✅ Products without stock → Show "OUT OF STOCK" label
✅ Logic correct? → Check if matches Admin Panel stock status
```

**Evidence to look for:**
- Browser F12 Console should show logs:
  ```
  📦 ProductCard received product {...}
  📊 ProductCard stock determination {
    stockStatusFromAPI: "IN_STOCK",
    canBuy: true,
    decision: "✅ SHOW BUY BUTTON"
  }
  ```

### Test 2: Add to Cart
**What to do:**
1. On homepage, click "Buy Now" button on a product
2. See if it adds to cart successfully
3. Check cart in top right

**Expected:**
- ✅ Product added to cart
- ✅ Quantity increments when clicking plus
- ✅ Quantity decrements when clicking minus

### Test 3: Check Backend Logs
**File:** `microservices/admin-catalogue-service/logs/admin-catalogue-service.log`

**Command:**
```powershell
# View last 30 lines
Get-Content "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 30
```

**Look for:**
```
✅ [GET /medicines] RESPONSE SENT: X medicines
📚 Fetching all medicines...
🔄 Converting medicine X to DTO
📊 Calculating stock status for medicineId: X
Found X batches for medicineId: X
✅ UNEXPIRED BATCH EXISTS - Returning IN_STOCK
or
❌ NO BATCHES FOUND - Returning OUT_OF_STOCK
```

### Test 4: Check Frontend Logs
**In Browser Console (F12):**
```javascript
// Look for these exact logs
console.log("📦 ProductCard received product")
console.log("📊 ProductCard stock determination")
```

**Or access localStorage logs:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('app_logs')).slice(-10).forEach(log => console.log(log.message, log.data))
```

### Test 5: Add Product and Verify Stock Count
**What to do:**
1. Go to Admin Panel
2. View a medicine
3. See "Total Quantity: X"
4. Go back to homepage
5. Check if the quantity display matches

**Expected:**
```
Admin: "Total Quantity: 50"
Frontend: "50 units left" (shown next to product)
```

---

## 📊 Stock Determination Logic

**Frontend Decision Flow:**
```
GET /medicines API Call
    ↓
Server returns:
  - stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "EXPIRED"
  - totalQuantity: Integer (sum of batch quantities)
    ↓
Frontend checks:
  IF stockStatus === "IN_STOCK" 
    → Show "Buy Now" button ✅
  ELSE IF totalQuantity > 0
    → Show "Buy Now" button ✅ (fallback)
  ELSE
    → Show "OUT OF STOCK" label ❌
```

**Backend Decision Flow:**
```
GET /medicines/{id}
    ↓
Query: SELECT * FROM batches WHERE medicine_id = ?
    ↓
For each batch:
  IF expiry_date > TODAY
    → Mark as unexpired ✅
    ↓
IF any unexpired batch found
  → Return stockStatus = "IN_STOCK" ✅
ELSE
  → Return stockStatus = "OUT_OF_STOCK" ❌
```

---

## 🔍 Troubleshooting

### Problem: Still showing "OUT OF STOCK"

**Step 1: Check API Response**
```javascript
// In browser console:
fetch('http://localhost:8080/api/medicines')
  .then(r => r.json())
  .then(data => {
    console.log('Medicines:', data);
    console.log('First medicine stockStatus:', data[0].stockStatus);
    console.log('First medicine totalQuantity:', data[0].totalQuantity);
  })
```

**Step 2: Check Backend Logs**
```powershell
# See what backend is calculating
Get-Content "c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 20
```

Look for:
- `Found X batches` - If 0, medicine has no batches
- `UNEXPIRED BATCH EXISTS` - Should see this
- `Return IN_STOCK` - What's being returned?

**Step 3: Check Database**
```sql
-- In MySQL:
SELECT m.id, m.name, COUNT(b.id) as batch_count, 
       MAX(b.expiry_date) as latest_expiry
FROM medicines m
LEFT JOIN batches b ON m.id = b.medicine_id
GROUP BY m.id;

-- Check specific batches:
SELECT * FROM batches WHERE medicine_id = 1;
```

**Step 4: Check Dates**
- Are batch expiry_dates in the FUTURE?
- Or are they in the PAST?
- Today's date is: `SELECT NOW();`

### Problem: Shows wrong quantity

**Check:**
1. Admin Panel: Medicine total quantity
2. Frontend: Display quantity
3. Database: Sum of batch quantities

```sql
SELECT m.id, m.name, 
       m.total_quantity as admin_total,
       SUM(b.quantity_available) as batch_total
FROM medicines m
LEFT JOIN batches b ON m.id = b.medicine_id
GROUP BY m.id;
```

---

## ✅ Success Checklist

After deploying, verify:

- [ ] Services start without errors
- [ ] Homepage loads with products
- [ ] Products show correct status (IN_STOCK or OUT_OF_STOCK)
- [ ] Browser console shows stock determination logs
- [ ] Can add products with stock to cart
- [ ] Backend logs show stock calculation
- [ ] API response includes stockStatus field
- [ ] Quantity display matches admin panel

---

## 📝 Log Examples

### Good Backend Log
```
[INFO] 🔷 [GET /medicines] REQUEST RECEIVED
[DEBUG] 📚 Fetching all medicines...
[DEBUG] 🔄 Converting medicine 1 to DTO
[DEBUG] 📊 Calculating stock status for medicineId: 1
[DEBUG] Found 3 batches for medicineId: 1
[DEBUG] ✅ UNEXPIRED BATCH EXISTS - Returning IN_STOCK
[INFO] ✅ [GET /medicines] RESPONSE SENT: 10 medicines
```

### Good Frontend Log
```
📦 ProductCard received product {
  id: 1,
  name: "Aspirin 500mg",
  stockStatus: "IN_STOCK",
  totalQuantity: 50,
  ...
}

📊 ProductCard stock determination {
  stockStatusFromAPI: "IN_STOCK",
  totalQuantity: 50,
  isStockStatusInStock: true,
  hasQuantity: true,
  canBuy: true,
  decision: "✅ SHOW BUY BUTTON"
}
```

---

**Ready to test?** Deploy and check the browser console for logs! 🚀
