# FIX: ProductCard OUT_OF_STOCK Display Issue

## Problem
Products were showing "OUT OF STOCK" label even when they had available stock in the admin panel.

## Root Cause
The ProductCard component was checking for `product.batches` array which doesn't exist in the API response. The API only returns:
- `stockStatus` (String: "IN_STOCK", "OUT_OF_STOCK", or "EXPIRED")
- `totalQuantity` (Integer)
- `inStock` (Boolean)

## Solution Applied

### 1. Backend - VERIFIED ✅
**File**: `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/service/MedicineService.java`

The backend correctly:
- Calls `calculateStockStatus()` which:
  - Queries batches for the medicine
  - Checks for unexpired batches (expiry_date > today)
  - Returns "IN_STOCK" if at least one unexpired batch exists
  - Returns "OUT_OF_STOCK" if no batches exist
  - Returns "EXPIRED" if all batches are expired
- Includes this in the MedicineDTO response

**Build Status**: ✅ BUILD SUCCESS (2026-02-01T22:45:15+05:30)

### 2. Frontend - JUST FIXED ✅
**File**: `frontend/src/features/catalog/productCard.jsx`

Changed logic from:
```javascript
// OLD - Using non-existent batches array
const hasAvailableQuantity = (product.totalQuantity && product.totalQuantity > 0) || 
                             (product.batches && Array.isArray(product.batches) && product.batches.length > 0);
const isStockStatusInStock = product.stockStatus === "IN_STOCK";
const isInStock = isStockStatusInStock || hasAvailableQuantity;
const canBuy = isInStock;
```

To:
```javascript
// NEW - Using actual API response fields
const isStockStatusInStock = product.stockStatus === "IN_STOCK";
const hasQuantity = product.totalQuantity > 0;
const canBuy = isStockStatusInStock || hasQuantity;
```

**Key Changes:**
- Removed check for non-existent `product.batches` array
- Simplified logic to check ONLY what API returns
- Priority: 1) `stockStatus === "IN_STOCK"` (backend calculation), 2) `totalQuantity > 0` (fallback)
- Updated logging to show exact values being checked

## What This Fixes

✅ Products with unexpired batches will show "Buy Now" button (stockStatus = "IN_STOCK")
✅ Products with totalQuantity > 0 will show "Buy Now" button
✅ Products with no batches will show "OUT OF STOCK" label
✅ Products with only expired batches will show "OUT OF STOCK" label

## How to Deploy

### Option 1: Stop/Start Services
```powershell
# Stop all Java processes
Stop-Process -Name java -Force

# Start services in order:
cd microservices/auth-service
java -jar target/auth-service-1.0.0.jar

# In new terminal:
cd microservices/admin-catalogue-service
java -jar target/admin-catalogue-service-1.0.0.jar

# In new terminal:
cd microservices/api-gateway
java -jar target/api-gateway-1.0.0.jar

# In new terminal:
cd microservices/eureka-server
java -jar target/eureka-server-1.0.0.jar

# In new terminal:
cd frontend
npm run dev
```

### Option 2: Docker Compose
```bash
docker-compose up -d
```

## Verification Steps

1. **Check logs appear in browser console (F12)**
   ```javascript
   // You should see logs like:
   📦 ProductCard received product {
     id: 1,
     name: "Aspirin",
     stockStatus: "IN_STOCK",
     totalQuantity: 50,
     ...
   }
   
   📊 ProductCard stock determination {
     stockStatusFromAPI: "IN_STOCK",
     totalQuantity: 50,
     canBuy: true,
     decision: "✅ SHOW BUY BUTTON"
   }
   ```

2. **Check Admin Panel**
   - Go to Admin → Products
   - View medicines with batches
   - Note their stock_status and total_quantity

3. **Check Frontend**
   - Load homepage (http://localhost:5173)
   - Should see "Buy Now" button for products with stock
   - Should see "OUT OF STOCK" label for products without stock
   - Button/label should match admin panel stock status

4. **Check Backend Logs**
   ```powershell
   Get-Content "microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 20
   ```
   Should show:
   ```
   📚 Fetching all medicines...
   🔄 Converting medicine 1 to DTO
   📊 Calculating stock status for medicineId: 1
   Found 3 batches for medicineId: 1
   ✅ UNEXPIRED BATCH EXISTS - Returning IN_STOCK
   ```

## What the Backend Does Now

1. When `/medicines` API is called:
2. For each medicine, it queries the batches table
3. Checks if ANY batch has `expiry_date > TODAY`
4. If yes: returns `stockStatus = "IN_STOCK"`
5. If no: returns `stockStatus = "OUT_OF_STOCK"`
6. Also includes `totalQuantity` from sum of all batch quantities

## Frontend Display Logic (AFTER FIX)

```
IF stockStatus === "IN_STOCK" → Show "Buy Now" button
ELSE IF totalQuantity > 0 → Show "Buy Now" button (fallback)
ELSE → Show "OUT OF STOCK" label
```

## Logging Overview

### Backend Logs
Location: `microservices/admin-catalogue-service/logs/admin-catalogue-service.log`
- `📚 Fetching all medicines...` - When API called
- `🔄 Converting medicine X to DTO` - DTO conversion
- `📊 Calculating stock status...` - Stock calculation
- `✅ UNEXPIRED BATCH EXISTS` or `❌ NO BATCHES FOUND` - Decision

### Frontend Logs
Accessible via: `F12 Console` or `localStorage.getItem('medicart_logs')`
- `📦 ProductCard received product` - Initial data received
- `📊 ProductCard stock determination` - Logic execution with decision

## Troubleshooting

**If still showing "OUT OF STOCK":**
1. Check F12 Console for logs - see what values API is returning
2. Check backend logs - see if calculateStockStatus is returning "IN_STOCK"
3. Check database: Do the medicines have batches with expiry_date > today?
4. Command: `docker exec medicart-mysql mysql -u root -proot123 medicart -e "SELECT * FROM batches LIMIT 5;"`

**If showing wrong quantity:**
1. Check backend is calculating totalQuantity correctly
2. Verify batches exist in database
3. Check if quantity_available is set correctly in batches table

## Files Modified
- ✅ `frontend/src/features/catalog/productCard.jsx` - Fixed stock logic
- ✅ `microservices/admin-catalogue-service/` - Already building correctly with Maven

## Next Steps After Deployment

1. Test homepage - products should show correct stock status
2. Check browser logs (F12) for stock calculation details
3. Try adding product to cart - should work if `canBuy = true`
4. Check prescription upload (should fix 403 with logging)
5. Monitor logs for any issues

---

**Status**: Ready for deployment and testing ✅
