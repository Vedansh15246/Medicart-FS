# 🔧 MEDICART SYSTEM - 500 ERROR FIX GUIDE

## Problem Analysis
- **Error**: `GET http://localhost:8080/medicines 500 (Internal Server Error)`
- **Root Cause**: The `medicines` table in `admin_catalogue_db` is **EMPTY**
- **Why**: You copied the database structure but not the data when moving to new laptop

## Solution Steps

### Step 1: Verify MySQL is Running
```powershell
# Check if MySQL service is running
Get-Service -Name "MySQL80" | Select-Object Status

# If not running, start it
Start-Service -Name "MySQL80"
```

### Step 2: Execute the Seed Data Script
Run the SQL script to populate all tables with sample data:

```powershell
# Navigate to project directory
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work"

# Import seed data using mysql command
mysql -u root -p"shahid" admin_catalogue_db < SEED_DATA_FIX.sql
```

### Step 3: Verify Data Was Inserted
```bash
mysql -u root -p"shahid" admin_catalogue_db -e "SELECT COUNT(*) AS medicine_count FROM medicines; SELECT COUNT(*) AS batch_count FROM batches;"
```

Expected output:
```
medicine_count: 10
batch_count: 11
```

### Step 4: Restart Backend Services
Make sure all backend services are running:

```powershell
# The AdminCatalogueServiceApplication should be running on port 8082
# The ApiGatewayApplication should be running on port 8080

# If using terminals in VS Code, check that these are running:
# - EurekaServerApplication (port 8761)
# - ApiGatewayApplication (port 8080)
# - AdminCatalogueServiceApplication (port 8082)
```

### Step 5: Test the API
```powershell
# Test using PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:8080/medicines" -Method Get
$response | ConvertTo-Json
```

Or test in browser:
```
http://localhost:8080/medicines
```

## Expected Response (After Fix)
```json
[
  {
    "id": 1,
    "name": "Aspirin",
    "category": "Pain Relief",
    "price": 150.0,
    "sku": "ASP-001",
    "requiresRx": false,
    "description": "Pain reliever and fever reducer",
    "inStock": true,
    "stockStatus": "IN_STOCK",
    "totalQuantity": 500
  },
  ... (9 more medicines)
]
```

## Database Schema Information

### Database Name
- `admin_catalogue_db`

### Tables
1. **medicines** (10 records inserted)
   - id, name, category, price, sku, requiresRx, description, inStock, totalQuantity
   
2. **batches** (11 records inserted)
   - id, medicine_id, batch_number, quantity_available, selling_price, expiry_date, status

### Connection Details
- **Host**: localhost:3306
- **Username**: root
- **Password**: shahid
- **Database**: admin_catalogue_db

## Alternative: If MySQL Command Not Available

Use MySQL Workbench:
1. Open MySQL Workbench
2. Connect to `localhost:3306` with root/shahid
3. Open the file `SEED_DATA_FIX.sql`
4. Execute the script (Ctrl+Shift+Enter)
5. Verify data was inserted

## Troubleshooting

### Error: "Access Denied"
```
Check username/password in application.properties:
- File: microservices/admin-catalogue-service/src/main/resources/application.properties
- spring.datasource.username=root
- spring.datasource.password=shahid
```

### Error: "Database Not Found"
```
The database must be created first:
mysql -u root -p"shahid" -e "CREATE DATABASE admin_catalogue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Error: "Port 8080/8082 Already in Use"
```powershell
# Kill the process using the port
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### Still Getting 500 Error After Data Insert

Check backend logs for specific error:
1. Look for `AdminCatalogueServiceApplication` terminal in VS Code
2. Search for "ERROR" or "Exception" in the logs
3. Common issues:
   - Foreign key constraint violations
   - Null pointer exceptions in data conversion
   - Database connection timeout

## Prevention for Future Transfers

Always include both structure AND data when copying databases:

```bash
# Export complete database with data
mysqldump -u root -p"shahid" admin_catalogue_db > admin_catalogue_db_complete.sql

# Later, import on new machine
mysql -u root -p"shahid" < admin_catalogue_db_complete.sql
```

## What Was Added

### 10 Sample Medicines:
1. Aspirin - Pain Relief
2. Amoxicillin - Antibiotics (Rx required)
3. Metformin - Diabetes (Rx required)
4. Lisinopril - Cardiac (Rx required)
5. Atorvastatin - Cardiac (Rx required)
6. Omeprazole - Gastrointestinal (Rx required)
7. Vitamin D3 - Vitamins
8. Cetirizine - Allergies
9. Ibuprofen - Pain Relief
10. Atenolol - Cardiac (Rx required)

### 11 Sample Batches:
- Each with quantity_available, selling_price, expiry_date, and status
- All set to ACTIVE status
- All with valid expiry dates (January-February 2026)

---
**Status**: Ready to apply fix
**Created**: 2026-02-02
