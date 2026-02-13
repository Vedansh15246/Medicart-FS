# 💊 MediCart — Medicine Catalog System

## What This Document Covers

How medicines are stored, displayed, searched, and managed:
- Medicine & Batch database entities
- Frontend HomePage with search and category filters
- Backend REST API for CRUD operations
- Stock status calculation from batches

---

## 📁 Files Involved

### Backend (Admin-Catalogue Service — Port 8082)
```
admin-catalogue-service/
├── entity/
│   ├── Medicine.java           ← Medicine database entity
│   └── Batch.java              ← Batch entity (stock tracking)
├── controller/
│   ├── MedicineController.java ← CRUD endpoints for medicines
│   └── BatchController.java    ← CRUD endpoints for batches
├── service/
│   ├── MedicineService.java    ← Business logic
│   └── BatchService.java       ← Batch management logic
├── repository/
│   ├── MedicineRepository.java ← Database queries
│   └── BatchRepository.java    ← Batch queries
└── resources/
    └── application.properties  ← Port 8082, DB: admin_catalogue_db
```

### Frontend
```
frontend/src/
├── api/
│   └── catalogService.js       ← API calls for medicines/batches
├── features/catalog/
│   ├── HomePage.jsx            ← Main page showing medicine grid
│   ├── productSlice.jsx        ← Redux slice for search state
│   └── catalogApi.js           ← Wrapper for fetching medicines
├── components/
│   └── modal/
│       └── MedicineModal.jsx   ← Medicine details popup
```

---

## 🗄️ Database Entities

### Medicine Entity (`medicines` table)

```java
@Entity
@Table(name = "medicines")
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                  // Auto-increment primary key

    @Column(nullable = false)
    private String name;              // e.g., "Paracetamol 500mg"

    @Column(nullable = false)
    private String category;          // e.g., "Pain Relief", "Antibiotics"

    @Column(nullable = false)
    private Double price;             // e.g., 25.50

    @Column(unique = true, nullable = false)
    private String sku;               // Stock Keeping Unit (unique code)

    @Builder.Default
    private Boolean requiresRx = false;  // Needs prescription?

    @Column(columnDefinition = "TEXT")
    private String description;       // Detailed description

    @Builder.Default
    private Integer totalQuantity = 0;   // Total stock count

    @Builder.Default
    private Boolean inStock = true;      // Is it available?

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**What each field means:**
- `name` — The medicine's name shown to customers
- `category` — Used for filtering (Pain Relief, Antibiotics, Supplements, etc.)
- `price` — The selling price in INR (₹)
- `sku` — A unique code like "PARA-500" (no two medicines can have the same SKU)
- `requiresRx` — If true, customer needs to upload a prescription
- `totalQuantity` — Auto-calculated from batches
- `inStock` — Determined by whether unexpired batches exist

### Batch Entity (`batches` table)

```java
@Entity
@Table(name = "batches")
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;        // Which medicine this batch belongs to

    private String batchNo;           // e.g., "BATCH-001"
    private LocalDate expiryDate;     // When this batch expires
    private Integer qtyAvailable;     // How many units are left
    private Integer qtyTotal;         // How many units were originally received

    @Version
    private Long version;             // Optimistic locking for concurrency
}
```

**Why do we need Batches?**

In a real pharmacy, medicines come in batches:
- Batch A: 100 units, expires Jan 2025
- Batch B: 50 units, expires Jun 2025

When someone orders, we sell from the batch expiring **soonest first** (FIFO — First In, First Out). This prevents medicines from expiring on the shelf.

---

## 🏠 Frontend — HomePage (Medicine Listing)

### How the HomePage Works

```jsx
// HomePage.jsx (simplified)
export default function HomePage() {
    // 1. Get search state from Redux
    const { q, category } = useSelector(state => state.product.search);
    
    // 2. Fetch medicines using TanStack Query
    const { data: medicines = [], isLoading } = useQuery({
        queryKey: ["medicines"],
        queryFn: fetchMedicines,         // Calls GET /medicines
    });
    
    // 3. Filter medicines based on search
    const filtered = medicines.filter(med => {
        const matchesSearch = !q || 
            med.name.toLowerCase().includes(q.toLowerCase());
        const matchesCategory = !category || 
            category === "All" || 
            med.category === category;
        return matchesSearch && matchesCategory;
    });
    
    // 4. Render
    return (
        <div>
            <Navbar />       {/* Search bar + navigation */}
            <CategoryBar />  {/* Category filter pills */}
            
            {/* Medicine Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(med => (
                    <ProductCard 
                        key={med.id} 
                        medicine={med}
                        onDetails={() => setSelectedMed(med)}
                        onAddToCart={() => handleAddToCart(med)}
                    />
                ))}
            </div>
            
            {/* Medicine Details Modal */}
            <MedicineModal medicine={selectedMed} />
        </div>
    );
}
```

### Key Concepts:

**TanStack Query (useQuery):**
```jsx
const { data, isLoading } = useQuery({
    queryKey: ["medicines"],     // Cache key
    queryFn: fetchMedicines,     // Function that fetches data
});
```
- Automatically caches data
- Shows loading state
- Refetches when needed
- No need for `useEffect` + `useState` pattern!

**Redux for Search State:**
```jsx
// productSlice.jsx
const productSlice = createSlice({
    name: "product",
    initialState: {
        search: { q: "", category: "" }
    },
    reducers: {
        setSearch: (state, action) => {
            state.search.q = action.payload;
        },
        setCategory: (state, action) => {
            state.search.category = action.payload;
        }
    }
});
```

When user types in the search bar → dispatches `setSearch("aspirin")` → Redux updates `search.q` → HomePage re-filters → UI updates instantly.

---

## 🔧 Backend — Medicine CRUD Operations

### MedicineController — API Endpoints

```java
@RestController
@RequestMapping("/medicines")
public class MedicineController {

    // GET /medicines — List all medicines
    @GetMapping
    public ResponseEntity<List<MedicineDTO>> getAllMedicines() {
        List<MedicineDTO> medicines = medicineService.getAllMedicines();
        return ResponseEntity.ok(medicines);
    }

    // GET /medicines/5 — Get single medicine
    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        MedicineDTO medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(medicine);
    }

    // POST /medicines — Create new medicine (Admin only)
    @PostMapping
    public ResponseEntity<MedicineDTO> createMedicine(@RequestBody MedicineDTO dto) {
        MedicineDTO created = medicineService.createMedicine(dto);
        return ResponseEntity.ok(created);
    }

    // PUT /medicines/5 — Update medicine (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<MedicineDTO> updateMedicine(
            @PathVariable Long id, @RequestBody MedicineDTO dto) {
        MedicineDTO updated = medicineService.updateMedicine(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /medicines/5 — Delete medicine (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();   // 204 No Content
    }
}
```

### Stock Status Calculation

The service calculates stock status dynamically from batches:

```java
// MedicineService.java
private String calculateStockStatus(Long medicineId) {
    List<Batch> batches = batchRepository.findByMedicineId(medicineId);

    if (batches == null || batches.isEmpty()) {
        return "OUT_OF_STOCK";    // No batches at all
    }

    LocalDate today = LocalDate.now();
    boolean hasUnexpiredBatch = batches.stream()
        .anyMatch(batch -> batch.getExpiryDate().isAfter(today));

    return hasUnexpiredBatch ? "IN_STOCK" : "EXPIRED";
}

private Integer calculateTotalQuantityFromBatches(Long medicineId) {
    List<Batch> batches = batchRepository.findByMedicineId(medicineId);
    LocalDate today = LocalDate.now();
    
    return batches.stream()
        .filter(batch -> batch.getExpiryDate().isAfter(today))  // Only unexpired
        .mapToInt(batch -> batch.getQtyAvailable())              // Get available qty
        .sum();                                                  // Add them up
}
```

**Example:**
```
Medicine: Paracetamol 500mg
├── Batch A: 30 units, expires 2024-01-15 (EXPIRED → excluded)
├── Batch B: 50 units, expires 2025-06-30 (valid → counted)
└── Batch C: 20 units, expires 2025-12-31 (valid → counted)

Stock Status: "IN_STOCK"
Total Quantity: 50 + 20 = 70
```

---

## 📦 Batch Management

### BatchController — API Endpoints

```java
@RestController
@RequestMapping("/batches")
public class BatchController {

    // GET /batches — All batches
    @GetMapping
    public List<BatchDTO> getAllBatches();

    // GET /batches/5/available — Available batches for medicine ID 5 (FIFO sorted)
    @GetMapping("/{medicineId}/available")
    public List<BatchDTO> getAvailableBatches(@PathVariable Long medicineId);

    // POST /batches — Create batch
    @PostMapping
    public BatchDTO createBatch(@RequestBody BatchDTO dto);

    // PUT /batches/5 — Update batch
    @PutMapping("/{id}")
    public BatchDTO updateBatch(@PathVariable Long id, @RequestBody BatchDTO dto);

    // DELETE /batches/5 — Delete batch
    @DeleteMapping("/{id}")
    public void deleteBatch(@PathVariable Long id);

    // PUT /batches/5/reduce-quantity?quantity=3 — Reduce stock after payment
    @PutMapping("/{batchId}/reduce-quantity")
    public void reduceBatchQuantity(@PathVariable Long batchId, @RequestParam Integer quantity);
}
```

### FIFO Batch Ordering

```java
// BatchRepository.java
@Query("SELECT b FROM Batch b WHERE b.medicine.id = :medicineId ORDER BY b.expiryDate ASC")
List<Batch> findByMedicineIdOrderByExpiryDate(Long medicineId);
```

This query sorts batches by expiry date (earliest first), so when an order is placed, stock is deducted from the batch expiring soonest — preventing waste.

---

## 🌐 Frontend API Calls

```javascript
// catalogService.js
const catalogService = {
    getMedicines: () => client.get("/medicines").then(r => r.data),
    getMedicineById: (id) => client.get(`/medicines/${id}`).then(r => r.data),
    getBatches: () => client.get("/batches").then(r => r.data),
    
    // Admin-only operations
    createMedicine: (data) => client.post("/medicines", data).then(r => r.data),
    updateMedicine: (id, data) => client.put(`/medicines/${id}`, data).then(r => r.data),
    deleteMedicine: (id) => client.delete(`/medicines/${id}`),
    createBatch: (data) => client.post("/batches", data).then(r => r.data),
    updateBatch: (id, data) => client.put(`/batches/${id}`, data).then(r => r.data),
    deleteBatch: (id) => client.delete(`/batches/${id}`),
};
```

---

## 🔑 Access Control

| Operation | Who Can Do It? |
|---|---|
| GET /medicines | Everyone (public) |
| GET /medicines/{id} | Everyone (public) |
| GET /batches | Everyone (public) |
| POST /medicines | Admin only |
| PUT /medicines/{id} | Admin only |
| DELETE /medicines/{id} | Admin only |
| POST /batches | Admin + Authenticated |
| DELETE /batches/{id} | Admin only |

This is enforced at the API Gateway level in `JwtAuthenticationFilter.java`:

```java
private boolean isAdminOnly(String path, HttpMethod method) {
    if (path.startsWith("/medicines") && 
        (POST.equals(method) || PUT.equals(method) || DELETE.equals(method))) {
        return true;  // Only ROLE_ADMIN can create/update/delete medicines
    }
    return false;
}
```

---

*Next: Read [04_CART.md](./04_CART.md) to learn about the shopping cart system.*
