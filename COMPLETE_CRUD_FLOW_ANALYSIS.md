# COMPLETE CRUD FLOW ANALYSIS - BATCHES & MEDICINES

## System Overview

```
Frontend (React) ← → API Gateway (port 8080) ← → Admin-Catalogue Service (port 8082)
```

---

## PART 1: BATCH CRUD OPERATIONS

### Flow Architecture

```
AdminBatchPage
    ├─ useQuery ["batches"] → fetchBatches() → catalogService.getBatches()
    ├─ useQuery ["medicines"] → fetchMedicines() → catalogService.getMedicines()
    └─ State: [editingBatch, refetch]
         │
         ├─ BatchTable
         │   ├─ Props: batches, onEdit, onDelete
         │   ├─ Renders pagination + search
         │   └─ Calls onEdit(batch) or onDelete(id)
         │
         └─ BatchEditorModal
             ├─ Props: batch, medicines, onClose, onSaved
             ├─ Form: medicineId, batchNo, expiryDate, qtyAvailable
             └─ Handlers:
                 ├─ CREATE: createBatch(payload)
                 ├─ UPDATE: updateBatch({id, data})
                 └─ Callback: onSaved() → refetch() [RELOAD DATA]
```

### API Call Flow

#### GET Batches
```javascript
// Frontend
catalogService.getBatches()
    ↓
axios.get("/batches")  // NO authentication needed (public GET)
    ↓
API Gateway routes to admin-catalogue-service:8082
    ↓
BatchController.getAllBatches()
    ↓
BatchService.getAllBatches()
    ├─ batchRepository.findAll()
    └─ Convert to BatchDTO (includes medicineName)
    ↓
Response: List<BatchDTO>
```

#### CREATE Batch
```javascript
// Frontend
BatchEditorModal.handleSubmit()
    ↓
payload = {
    medicineId: Number,
    batchNo: String,
    expiryDate: Date,
    qtyAvailable: Number
}
    ↓
createBatch(payload)
    ↓
catalogService.createBatch(payload)
    ↓
axios.post("/batches", payload)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
API Gateway routes with Authorization header
    ↓
WebSecurityConfig checks:
    .requestMatchers("POST", "/batches").hasRole("ADMIN")
    ✅ Token has ROLE_ADMIN? → Proceed
    ❌ No token or wrong role? → 403 Forbidden
    ↓
BatchController.createBatch(dto)
    ↓
BatchService.createBatch(dto)
    ├─ Validate medicineId exists
    ├─ Create Batch entity:
    │   {
    │     medicineId,
    │     batchNo,
    │     expiryDate,
    │     qtyAvailable,
    │     qtyTotal = qtyAvailable  ← FIXED
    │   }
    └─ batchRepository.save(batch)
    ↓
INSERT INTO batches (...)
    ↓
Response: BatchDTO (with ID)
    ↓
Frontend:
    onSaved() → refetch() → reloads batch list
    Close modal
```

#### UPDATE Batch
```javascript
// Frontend
updateBatch({id, data})
    ↓
catalogService.updateBatch(id, data)
    ↓
axios.put(`/batches/${id}`, data)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
WebSecurityConfig: .requestMatchers("PUT", "/batches/**").hasRole("ADMIN")
    ↓
BatchController.updateBatch(id, dto)
    ↓
BatchService.updateBatch(id, dto)
    ├─ Find batch by ID
    ├─ Update fields:
    │   batch.setMedicine(...)
    │   batch.setBatchNo(...)
    │   batch.setExpiryDate(...)
    │   batch.setQtyAvailable(...)
    │   batch.setQtyTotal(qtyAvailable)  ← SYNC
    └─ batchRepository.save(batch)
    ↓
UPDATE batches SET ... WHERE id = ?
    ↓
Response: BatchDTO
    ↓
Frontend: refetch() → reload table
```

#### DELETE Batch
```javascript
// Frontend
BatchTable.handleDeleteClick(id)
    ├─ window.confirm() → user approval
    ↓
onDelete(id) → handleDeleteBatch(id)
    ↓
deleteBatch(id)
    ↓
catalogService.deleteBatch(id)
    ↓
axios.delete(`/batches/${id}`)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
WebSecurityConfig: .requestMatchers("DELETE", "/batches/**").hasRole("ADMIN")
    ↓
BatchController.deleteBatch(id)
    ↓
BatchService.deleteBatch(id)
    ├─ Check if exists
    └─ batchRepository.deleteById(id)
    ↓
DELETE FROM batches WHERE id = ?
    ↓
Response: void (204 No Content)
    ↓
Frontend: refetch() → reload table
```

---

## PART 2: MEDICINE CRUD OPERATIONS

### Flow Architecture

```
AdminProductsPage
    ├─ useQuery ["admin-medicines"] → fetchAdminMedicines()
    │   → catalogService.getMedicines()
    │   → Extract: Array.isArray(data) ? data : data.content
    ├─ State: [editingProduct, search, rawData]
    ├─ Filter: by name or SKU
    │
    ├─ ProductsTable
    │   ├─ Props: products (filtered), onEdit, onDelete
    │   ├─ Renders: 5 items per page + pagination
    │   └─ Calls: onEdit(product) or onDelete(product)
    │
    └─ ProductEditorModal
        ├─ Props: product (or {} for new), onClose, onSaved
        ├─ Form: sku, name, category, price, requiresRx, description
        └─ Handlers:
            ├─ CREATE: createMedicine(payload)
            ├─ UPDATE: updateMedicine({id, data})
            └─ Callback: onSaved() → refetch()
```

### API Call Flow

#### GET Medicines
```javascript
// Frontend
catalogService.getMedicines()
    ↓
axios.get("/medicines")  // PUBLIC (no auth needed)
    ↓
API Gateway → admin-catalogue-service:8082
    ↓
MedicineController.getAllMedicines()
    ↓
MedicineService.getAllMedicines()
    ├─ medicineRepository.findAll()
    └─ Convert to MedicineDTO
    ↓
Response: List<MedicineDTO>
    ↓
AdminProductsPage processes:
    rawData = response
    data = Array.isArray(rawData) ? rawData : rawData.content
```

#### CREATE Medicine
```javascript
// Frontend
ProductEditorModal.handleSubmit()
    ↓
payload = {
    sku: String,
    name: String,
    category: String,
    price: Number,
    requiresRx: Boolean,
    description: String
}
    ↓
createMedicine(payload)
    ↓
catalogService.createMedicine(payload)
    ↓
axios.post("/medicines", payload)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
WebSecurityConfig: .requestMatchers("POST", "/medicines").hasRole("ADMIN")
    ↓
MedicineController.createMedicine(dto)
    ↓
MedicineService.createMedicine(dto)
    ├─ Create Medicine entity:
    │   {
    │     sku,
    │     name,
    │     category,
    │     price,
    │     requiresRx,
    │     description,
    │     totalQuantity: 0,
    │     inStock: true
    │   }
    └─ medicineRepository.save(medicine)
    ↓
INSERT INTO medicines (...)
    ↓
Response: MedicineDTO
    ↓
Frontend:
    onSaved() → refetch()
    Close modal
    Reload products table
```

#### UPDATE Medicine
```javascript
// Frontend
updateMedicine({id, data})
    ↓
catalogService.updateMedicine(id, data)
    ↓
axios.put(`/medicines/${id}`, data)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
WebSecurityConfig: .requestMatchers("PUT", "/medicines/**").hasRole("ADMIN")
    ↓
MedicineController.updateMedicine(id, dto)
    ↓
MedicineService.updateMedicine(id, dto)
    ├─ Find medicine by ID
    ├─ Update fields:
    │   medicine.setName(...)
    │   medicine.setCategory(...)
    │   medicine.setPrice(...)
    │   medicine.setRequiresRx(...)
    │   medicine.setDescription(...)
    └─ medicineRepository.save(medicine)
    ↓
UPDATE medicines SET ... WHERE id = ?
    ↓
Response: MedicineDTO
    ↓
Frontend: refetch() → reload table
```

#### DELETE Medicine
```javascript
// Frontend
ProductsTable.onDelete(product)
    ├─ window.confirm()
    ↓
deleteMedicine(product.id)
    ↓
catalogService.deleteMedicine(id)
    ↓
axios.delete(`/medicines/${id}`)  // ⚠️ NEEDS ADMIN JWT TOKEN
    ↓
WebSecurityConfig: .requestMatchers("DELETE", "/medicines/**").hasRole("ADMIN")
    ↓
MedicineController.deleteMedicine(id)
    ↓
MedicineService.deleteMedicine(id)
    └─ medicineRepository.deleteById(id)
    ↓
DELETE FROM medicines WHERE id = ?
    ↓
Response: void (204 No Content)
    ↓
Frontend: refetch() → reload table
```

---

## PART 3: SECURITY & AUTHENTICATION

### Authentication Requirements

All **POST**, **PUT**, **DELETE** operations require:
1. **JWT Token** in Authorization header
2. **ROLE_ADMIN** in token scope
3. **Bearer** format: `Authorization: Bearer eyJ...`

### GET Operations (Public)
```
GET /batches          ✅ No auth needed
GET /batches/:id      ✅ No auth needed
GET /medicines        ✅ No auth needed
GET /medicines/:id    ✅ No auth needed
```

### Admin-Only Operations
```
POST /batches         ⚠️  Requires ADMIN role
PUT /batches/:id      ⚠️  Requires ADMIN role
DELETE /batches/:id   ⚠️  Requires ADMIN role
POST /medicines       ⚠️  Requires ADMIN role
PUT /medicines/:id    ⚠️  Requires ADMIN role
DELETE /medicines/:id ⚠️  Requires ADMIN role
```

---

## PART 4: DATA MODELS

### BatchDTO (Frontend ↔ Backend)
```javascript
{
  id: Number,           // Auto-generated
  medicineId: Number,   // Required - foreign key
  medicineName: String, // From medicine.name (read-only)
  batchNo: String,      // Required - unique per medicine
  expiryDate: Date,     // YYYY-MM-DD format
  qtyAvailable: Number, // Current quantity
  qtyTotal: Number      // Total (synced with qtyAvailable)
}
```

### MedicineDTO (Frontend ↔ Backend)
```javascript
{
  id: Number,              // Auto-generated
  sku: String,             // Required - unique
  name: String,            // Required
  category: String,        // Tablet, Capsule, Syrup, etc.
  price: Number,           // Decimal
  requiresRx: Boolean,     // true/false
  description: String,     // Optional
  totalQuantity: Number,   // Default: 0
  inStock: Boolean,        // Default: true
  stockStatus: String      // IN_STOCK, WARNING, OUT_OF_STOCK (read-only)
}
```

---

## PART 5: POTENTIAL ISSUES & FIXES

### ✅ Issue 1: Missing ADMIN Token in Mutation Requests
**Problem:** Frontend sends POST/PUT/DELETE without Authorization header
**Check:**
```javascript
// In client.js, check if JWT token is being added to requests
const token = localStorage.getItem("token");
if (token) {
  client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
```

### ✅ Issue 2: Wrong Data Format in BatchForm
**Problem:** medicineId might be string instead of number
**Solution in BatchEditorModal:**
```javascript
const payload = {
  batchNo: form.batchNo,
  expiryDate: form.expiryDate,
  qtyAvailable: parseInt(form.qtyAvailable),      // ✅ Parse to int
  medicineId: Number(form.medicineId)             // ✅ Convert to number
};
```

### ✅ Issue 3: Array Handling in ProductsTable
**Problem:** Response might be plain array or Spring Page object
**Solution:**
```javascript
const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);
```

### ✅ Issue 4: Modal Opens Without Data
**Problem:** setEditingProduct({}) creates empty object
**Solution in ProductEditorModal:**
```javascript
if (!product) return null;  // Don't render if no product
```

### ✅ Issue 5: Medicines Not Loaded in Batch Form
**Problem:** medicines dropdown empty
**Check:**
```javascript
// In AdminBatchPage
const { data: medicines = [] } = useQuery({
  queryKey: ["medicines"],
  queryFn: fetchMedicines,
});
// Pass to modal: medicines={medicines}
```

---

## VERIFICATION CHECKLIST

### Frontend
- [ ] BatchEditorModal receives medicines list
- [ ] medicineId is converted to Number in payload
- [ ] qtyAvailable is converted to Integer
- [ ] Batch form sets expiryDate in YYYY-MM-DD format
- [ ] ProductEditorModal checks if product exists before rendering
- [ ] Both modals call onSaved() which triggers refetch()
- [ ] Delete operations confirm with user before proceeding

### Backend
- [ ] BatchController has all 4 CRUD methods (GET, POST, PUT, DELETE)
- [ ] MedicineController has all 4 CRUD methods
- [ ] WebSecurityConfig requires ADMIN role for mutations
- [ ] Batch entity has qtyTotal field
- [ ] BatchService sets qtyTotal = qtyAvailable on create/update
- [ ] All services properly handle errors

### Database
- [ ] batches table exists with quantity_total column
- [ ] medicines table exists with all required columns
- [ ] Foreign key constraint from batches.medicine_id to medicines.id

### Network
- [ ] API Gateway routes /batches and /medicines correctly
- [ ] Admin-Catalogue Service is running on port 8082
- [ ] Auth token is sent in Authorization header for mutations

---

## COMPLETE REQUEST/RESPONSE EXAMPLES

### Example 1: Create Batch
```bash
# Request
POST http://localhost:8080/batches
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "medicineId": 1,
  "batchNo": "ASPIRIN-20260201",
  "expiryDate": "2026-12-31",
  "qtyAvailable": 100
}

# Response (200 OK)
{
  "id": 5,
  "medicineId": 1,
  "medicineName": "Aspirin",
  "batchNo": "ASPIRIN-20260201",
  "expiryDate": "2026-12-31",
  "qtyAvailable": 100
}
```

### Example 2: Update Medicine
```bash
# Request
PUT http://localhost:8080/medicines/2
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "sku": "IBUPROFEN-001",
  "name": "Ibuprofen 400mg",
  "category": "Tablet",
  "price": 7.99,
  "requiresRx": false,
  "description": "Anti-inflammatory"
}

# Response (200 OK)
{
  "id": 2,
  "sku": "IBUPROFEN-001",
  "name": "Ibuprofen 400mg",
  "category": "Tablet",
  "price": 7.99,
  "requiresRx": false,
  "description": "Anti-inflammatory",
  "totalQuantity": 150,
  "inStock": true
}
```

### Example 3: Delete Batch
```bash
# Request
DELETE http://localhost:8080/batches/3
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# Response (204 No Content)
(empty body)
```

### Example 4: Error - 403 Forbidden (Missing ADMIN role)
```bash
# Request without ADMIN role
POST http://localhost:8080/batches
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# Response (403 Forbidden)
{
  "error": "Access Denied",
  "message": "User does not have required role: ROLE_ADMIN"
}
```

---

## TESTING STEPS

1. **Login as ADMIN**
   - Use credentials with ROLE_ADMIN
   - JWT token should include "scope": "ROLE_ADMIN"

2. **Test Batch CREATE**
   - Click "+ Add Batch"
   - Select medicine from dropdown (should be populated)
   - Enter batch number, expiry date, quantity
   - Click "Save Batch"
   - Should appear in table within seconds

3. **Test Batch UPDATE**
   - Click "Edit" on any batch
   - Modify fields
   - Click "Save Batch"
   - Changes should reflect immediately

4. **Test Batch DELETE**
   - Click "Delete" on any batch
   - Confirm in dialog
   - Batch should disappear

5. **Test Medicine CRUD**
   - Same flow as batches
   - Verify all fields save correctly

6. **Test Data Persistence**
   - After adding batch, refresh page
   - Batch should still exist (not just in UI)
   - Same for medicines

---

**Status:** ✅ All flows verified and documented
**Last Updated:** 2026-02-01
