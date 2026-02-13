# 07 — Address & Delivery

## 📌 What This Feature Does

The Address feature lets users **save, edit, delete, and select delivery addresses** before placing an order. Users can have multiple addresses, mark one as "default", and choose which address to deliver to during checkout.

**User flow:**
```
Cart Page → "Proceed to Checkout" → Address Page → Select/Add Address → "Continue to Payment" → Payment Select
```

---

## 🏗️ Architecture Overview

```
User manages addresses on AddressPage
        │
        ▼
┌─────────────────────┐
│  Frontend (React)   │
│  AddressPage.jsx    │  (parent page)
│  AddressList.jsx    │  (displays saved addresses)
│  AddressForm.jsx    │  (add/edit form with validation)
└─────────┬───────────┘
          │  HTTP calls via addressService
          ▼
┌─────────────────────┐
│   API Gateway       │  (port 8080)
│   Adds X-User-Id    │  (from JWT token)
└─────────┬───────────┘
          │  Routes to cart-orders-service
          ▼
┌─────────────────────┐
│  Cart-Orders Service│  (port 8083)
│  AddressController  │
│  AddressService     │
│  Address entity     │  → addresses table in MySQL
└─────────────────────┘
```

---

## 📂 File Map

### Backend (Cart-Orders Service — port 8083)

| File | Purpose |
|------|---------|
| `cart-orders-service/.../entity/Address.java` | Database entity for addresses |
| `cart-orders-service/.../controller/AddressController.java` | REST API endpoints |
| `cart-orders-service/.../service/AddressService.java` | Business logic (CRUD + default management) |
| `cart-orders-service/.../repository/AddressRepository.java` | JPA database queries |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/api/orderService.js` | `addressService` API calls (exported alongside orderService) |
| `frontend/src/features/delivery/AddressPage.jsx` | Main page component (parent) |
| `frontend/src/features/delivery/AddressForm.jsx` | Add/Edit address form with validation |
| `frontend/src/features/delivery/AddressList.jsx` | List of saved address cards |
| `frontend/src/features/delivery/AddressPage.css` | Styles for AddressPage |
| `frontend/src/features/delivery/AddressForm.css` | Styles for the form |
| `frontend/src/features/delivery/AddressList.css` | Styles for address cards |

---

## 🔧 Backend — Address Entity

```java
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;            // Which user owns this address

    private String name;            // Recipient's full name ("John Doe")
    private String streetAddress;   // "123 Main Street"
    private String addressLine1;    // "Apt 4B, Floor 2"
    private String addressLine2;    // "Near City Mall" (optional)
    private String city;            // "Mumbai"
    private String state;           // "Maharashtra"
    private String postalCode;      // "400001"
    private String country;         // "India" (default: "USA")
    private String phone;           // "9876543210"
    private Boolean isDefault;      // true if this is the user's default address

    private LocalDateTime createdAt;  // Auto-set on insert
    private LocalDateTime updatedAt;  // Auto-set on update
}
```

**Key details:**
- `@Builder.Default` — Sets default values when using the Builder pattern:
  ```java
  @Builder.Default
  private String name = "";        // If not provided, defaults to ""
  
  @Builder.Default
  private String country = "USA";  // Default country
  
  @Builder.Default
  private Boolean isDefault = false; // New addresses are not default by default
  ```
- `@PrePersist` / `@PreUpdate` — JPA lifecycle callbacks that automatically set timestamps
- `addressLine2` has no `nullable = false` — it's optional

### Database Table (`addresses`)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | BIGINT (PK) | No | Auto-increment |
| `user_id` | BIGINT | No | Owner of this address |
| `name` | VARCHAR | No | Recipient name |
| `street_address` | VARCHAR | No | Street address |
| `address_line1` | VARCHAR | No | Additional line |
| `address_line2` | VARCHAR | Yes | Optional second line |
| `city` | VARCHAR | No | City name |
| `state` | VARCHAR | No | State name |
| `postal_code` | VARCHAR | No | ZIP/PIN code |
| `country` | VARCHAR | No | Country (default "USA") |
| `phone` | VARCHAR | No | Phone number |
| `is_default` | BOOLEAN | No | Is this the default address? |
| `created_at` | DATETIME | No | Created timestamp |
| `updated_at` | DATETIME | Yes | Last updated timestamp |

---

## 🔧 Backend — AddressController (REST API)

### All Endpoints

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| `POST` | `/api/address` | Create new address | User (X-User-Id) |
| `GET` | `/api/address` | Get all addresses for user | User (X-User-Id) |
| `GET` | `/api/address/{id}` | Get single address | User (X-User-Id) |
| `PUT` | `/api/address/{id}` | Update an address | User (X-User-Id) |
| `DELETE` | `/api/address/{id}` | Delete an address | User (X-User-Id) |

### Create Address (with Validation)

```java
@PostMapping
public ResponseEntity<AddressDTO> addAddress(
        @RequestHeader("X-User-Id") Long userId,  // From API Gateway (decoded JWT)
        @RequestBody AddressDTO addressDTO) {
    try {
        // Manual validation — check required fields
        StringBuilder validationErrors = new StringBuilder();
        
        if (addressDTO.getName() == null || addressDTO.getName().trim().isEmpty())
            validationErrors.append("name is required. ");
        if (addressDTO.getStreetAddress() == null || addressDTO.getStreetAddress().trim().isEmpty())
            validationErrors.append("streetAddress is required. ");
        if (addressDTO.getCity() == null || addressDTO.getCity().trim().isEmpty())
            validationErrors.append("city is required. ");
        if (addressDTO.getState() == null || addressDTO.getState().trim().isEmpty())
            validationErrors.append("state is required. ");
        if (addressDTO.getPostalCode() == null || addressDTO.getPostalCode().trim().isEmpty())
            validationErrors.append("postalCode is required. ");
        if (addressDTO.getPhone() == null || addressDTO.getPhone().trim().isEmpty())
            validationErrors.append("phone is required. ");

        if (validationErrors.length() > 0) {
            log.warn("Address validation failed: {}", validationErrors);
            return ResponseEntity.badRequest().body(null);  // 400 Bad Request
        }

        AddressDTO newAddress = addressService.addAddress(userId, addressDTO);
        return ResponseEntity.ok(newAddress);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}
```

**Why manual validation instead of `@Valid`?**  
The project uses manual `if` checks instead of Jakarta Bean Validation (`@Valid`, `@NotBlank`). Both approaches work — manual validation gives more control over error messages but is more verbose.

---

## 🔧 Backend — AddressService (Business Logic)

### Default Address Management

The most interesting part is how "default address" works. Only **one** address can be default per user.

```java
public AddressDTO addAddress(Long userId, AddressDTO addressDTO) {
    // If the new address is marked as default...
    if (addressDTO.getIsDefault()) {
        // Find the CURRENT default address and un-default it
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);       // Remove default flag
                    addressRepository.save(addr);   // Save the change
                });
    }

    // Build the new Address entity from DTO
    Address address = Address.builder()
            .userId(userId)
            .name(addressDTO.getName() != null ? addressDTO.getName() : "")
            .streetAddress(addressDTO.getStreetAddress())
            .addressLine1(addressDTO.getAddressLine1() != null ? addressDTO.getAddressLine1() : "")
            .addressLine2(addressDTO.getAddressLine2())  // Can be null (optional)
            .city(addressDTO.getCity())
            .state(addressDTO.getState())
            .postalCode(addressDTO.getPostalCode())
            .country(addressDTO.getCountry() != null ? addressDTO.getCountry() : "USA")
            .phone(addressDTO.getPhone())
            .isDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false)
            .build();

    address = addressRepository.save(address);
    return convertToDTO(address);  // Convert entity → DTO for response
}
```

**Step-by-step:**
1. User sends: `{ name: "John", city: "Mumbai", isDefault: true }`
2. Service checks: Is `isDefault` = true?
3. If yes → Find current default address → Set its `isDefault` to false → Save
4. Then create the new address with `isDefault: true`
5. Result: Only the NEW address is now default

### Ownership Check

Every read/update/delete checks that the address belongs to the requesting user:

```java
public AddressDTO getAddressById(Long addressId, Long userId) {
    Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found"));

    // SECURITY CHECK: Does this address belong to this user?
    if (!address.getUserId().equals(userId)) {
        throw new RuntimeException("Unauthorized to access this address");
    }

    return convertToDTO(address);
}
```

This prevents User A from reading/editing/deleting User B's addresses.

### Entity ↔ DTO Conversion

```java
private AddressDTO convertToDTO(Address address) {
    return AddressDTO.builder()
            .id(address.getId())
            .name(address.getName())
            .streetAddress(address.getStreetAddress())
            .addressLine1(address.getAddressLine1())
            .addressLine2(address.getAddressLine2())
            .city(address.getCity())
            .state(address.getState())
            .postalCode(address.getPostalCode())
            .country(address.getCountry())
            .phone(address.getPhone())
            .isDefault(address.getIsDefault())
            .build();
}
```

**Why DTO?** 
- **Entity** = direct database mapping (has JPA annotations, timestamps, etc.)
- **DTO** = what we send to the frontend (only the fields the client needs)
- Avoids exposing internal fields like `createdAt`, `updatedAt`

---

## 🎨 Frontend — Address API Service

The address API functions live inside `orderService.js` (not in a separate file):

```javascript
// frontend/src/api/orderService.js

export const addressService = {
  // Get all addresses for the logged-in user
  getAddresses: async () => {
    const response = await client.get("/api/address");
    return response.data;
    // Returns: [{ id, name, streetAddress, city, state, postalCode, phone, isDefault, ... }]
  },

  // Get a single address by ID
  getAddressById: async (addressId) => {
    const response = await client.get(`/api/address/${addressId}`);
    return response.data;
  },

  // Create a new address
  createAddress: async (addressData) => {
    const response = await client.post("/api/address", addressData);
    return response.data;
  },

  // Update an existing address
  updateAddress: async (addressId, addressData) => {
    const response = await client.put(`/api/address/${addressId}`, addressData);
    return response.data;
  },

  // Delete an address
  deleteAddress: async (addressId) => {
    const response = await client.delete(`/api/address/${addressId}`);
    return response.data;
  },
};
```

Note: `X-User-Id` header is automatically added by the Axios interceptor in `client.js`, so we don't need to pass it manually.

---

## 🎨 Frontend — AddressPage (Parent Component)

**File:** `AddressPage.jsx`  
**Route:** `/address`

This is the main page that combines the address list and the add/edit form. It manages all state.

### State Variables

```javascript
const [addresses, setAddresses] = useState([]);    // All saved addresses
const [editing, setEditing] = useState(null);       // ID of address being edited (null = adding new)
const [selectedId, setSelectedId] = useState(null); // Which address is selected for delivery
const [loading, setLoading] = useState(true);       // Loading spinner
const [showForm, setShowForm] = useState(false);    // Show/hide the form section
```

### Fetching Addresses on Page Load

```javascript
const fetchAddresses = async () => {
    setLoading(true);
    try {
        const data = await addressService.getAddresses();
        setAddresses(data);
        
        // Auto-select the default address
        const def = data.find(a => a.isDefault === true);
        if (def) setSelectedId(def.id);
        else if (data.length > 0) setSelectedId(data[0].id);  // Or first address
    } catch (err) {
        console.error("Error fetching addresses", err);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchAddresses();  // Run on component mount
}, []);
```

### Event Handlers

```javascript
// Set an address as default
const handleSetDefault = async (id) => {
    const target = addresses.find(a => a.id === id);
    await addressService.updateAddress(id, { ...target, isDefault: true });
    fetchAddresses();  // Refresh list to see the change
};

// Save (create or update) an address
const handleSave = async (payload) => {
    if (editing) {
        // Editing existing address
        await addressService.updateAddress(editing, payload);
    } else {
        // Creating new address
        await addressService.createAddress(payload);
    }
    setEditing(null);
    setShowForm(false);
    fetchAddresses();  // Refresh list
};

// Delete an address (with confirmation dialog)
const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;  // Browser confirm dialog
    await addressService.deleteAddress(id);
    fetchAddresses();  // Refresh list
};

// Edit an address (opens form with existing data)
const handleEdit = (id) => {
    setEditing(id);        // Store which address we're editing
    setShowForm(true);     // Show the form
    // Scroll to top on mobile
    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
```

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  Header: "Delivery Addresses"  [← Back to Cart] │
├─────────────────────┬───────────────────────────┤
│  SAVED ADDRESSES    │  ADD/EDIT FORM            │
│  (AddressList)      │  (AddressForm)            │
│                     │  (shown conditionally)    │
│  [Address Card 1]   │  Name: [________]         │
│  [Address Card 2]   │  Phone: [________]        │
│  [Address Card 3]   │  Street: [________]       │
│                     │  City: [________]         │
│  [+ Add New Address]│  State: [________]        │
│                     │  PIN: [________]          │
│  [Continue to       │  [Save] [Cancel]          │
│   Payment →]        │                           │
└─────────────────────┴───────────────────────────┘
```

The form is only shown when `showForm` is `true`. Initially hidden — users see only their saved addresses.

---

## 🎨 Frontend — AddressForm (Form with Validation)

**File:** `AddressForm.jsx`

### Initial Form State

```javascript
const initial = {
    name: '',
    streetAddress: '',
    addressLine1: '',
    addressLine2: '',
    phone: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',       // Default country
    isDefault: false,
};
```

### Form State Management

```javascript
const [form, setForm] = useState(initial);      // Current form values
const [errors, setErrors] = useState({});        // Validation error messages
const [touched, setTouched] = useState({});      // Which fields have been interacted with

// When editing, populate form with existing address data
useEffect(() => {
    setForm(initialValues ? { ...initial, ...initialValues } : initial);
    setErrors({});
    setTouched({});
}, [initialValues]);
```

### Validation Rules

```javascript
const validate = () => {
    const e = {};
    
    // Required field checks
    if (!form.name.trim())          e.name = 'Full name is required';
    if (!form.streetAddress.trim()) e.streetAddress = 'Street address is required';
    if (!form.addressLine1.trim())  e.addressLine1 = 'Address line 1 is required';
    if (!form.city.trim())          e.city = 'City is required';
    if (!form.state.trim())         e.state = 'State is required';
    
    // Pattern checks
    if (!/^\d{10}$/.test(form.phone))     e.phone = 'Phone must be 10 digits';
    if (!/^\d{6}$/.test(form.postalCode)) e.postalCode = 'PIN code must be 6 digits';
    
    setErrors(e);
    return Object.keys(e).length === 0;  // Returns true if no errors
};
```

**Regex explained:**
- `^\d{10}$` — Exactly 10 digits (Indian phone number): `^` start, `\d` digit, `{10}` exactly 10 times, `$` end
- `^\d{6}$` — Exactly 6 digits (Indian PIN code)

### Smart Field Validation (On Blur + On Change)

```javascript
// Called when user clicks into and then clicks out of a field
const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
};

// Called on every keystroke
const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // If field was already touched, clear its error
    // This gives immediate feedback after first validation
    if (touched[field]) {
        const tempErrors = { ...errors };
        delete tempErrors[field];
        setErrors(tempErrors);
    }
};
```

**UX pattern:**
1. User types in "Name" field → no error shown yet
2. User clicks to "Phone" field → `handleBlur('name')` marks name as `touched`
3. User clicks "Save" → `validate()` shows "Full name is required" under the Name field
4. User types a name → `handleChange` clears the error immediately

### Form Submission

```javascript
const handleSubmit = (e) => {
    e.preventDefault();           // Prevent page reload
    if (!validate()) return;      // Show errors, don't submit
    
    const payload = { ...form, isDefault: !!form.isDefault };
    // !! converts truthy/falsy to actual boolean (undefined → false, true → true)
    
    onSubmit && onSubmit(payload);  // Call parent's handleSave
    
    // Reset form only when adding new (not editing)
    if (!initialValues) {
        setForm(initial);
        setTouched({});
    }
};
```

---

## 🎨 Frontend — AddressList (Selectable Cards)

**File:** `AddressList.jsx`

### Props

```javascript
const AddressList = ({ 
    addresses,    // Array of address objects
    selectedId,   // Currently selected address ID
    onSelect,     // Function to call when user clicks a card
    onEdit,       // Function to call when user clicks "Edit"
    onDelete,     // Function to call when user clicks "Delete"
    onSetDefault  // Function to call when user clicks "Set Default"
}) => { ... }
```

### Empty State

```javascript
if (!addresses || addresses.length === 0) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <div>No saved addresses yet. Add your first address above.</div>
        </div>
    );
}
```

### Address Card

Each address renders as a clickable card:

```jsx
<div
    className={`address-card ${selectedId === a.id ? 'selected' : ''}`}
    onClick={() => onSelect(a.id)}  // Select this address for delivery
>
    {/* Header with Default badge */}
    <div className="card-header">
        <div className="card-label">Address</div>
        {a.isDefault && <div className="tag-default">Default</div>}
    </div>

    {/* Address details */}
    <div className="card-body">
        <div>Name: {a.name}</div>
        <div>Phone: {a.phone}</div>
        <div>Address: {a.streetAddress}, {a.addressLine1}</div>
        <div>City: {a.city} | State: {a.state} | PIN: {a.postalCode}</div>
    </div>

    {/* Action buttons */}
    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onEdit(a.id)}>Edit</button>
        <button onClick={() => onDelete(a.id)}>Delete</button>
        {!a.isDefault && (
            <button onClick={() => onSetDefault(a.id)}>Set Default</button>
        )}
    </div>
</div>
```

**Key detail: `e.stopPropagation()`**
```javascript
<div className="card-actions" onClick={(e) => e.stopPropagation()}>
```
Without this, clicking "Edit" or "Delete" would also trigger the card's `onSelect`. `stopPropagation()` prevents the click event from "bubbling up" to the parent `div`.

### Selected State

```css
/* When a card is selected, it gets a highlighted border */
.address-card.selected {
    border-color: #2fbf5d;  /* Green border */
    background: #f0fdf4;    /* Light green background */
}
```

---

## 🔄 Complete Address Flow

### Adding a New Address

```
1. User on AddressPage → clicks "+ Add New Address"
      │  setShowForm(true)
      ▼
2. AddressForm renders with empty fields
      │  User fills in: Name, Phone, Street, City, State, PIN
      ▼
3. User clicks "Save Address"
      │  handleSubmit() → validate() → all fields OK
      ▼
4. AddressPage.handleSave(payload) called
      │  addressService.createAddress(payload)
      │  POST /api/address → API Gateway → cart-orders-service
      ▼
5. AddressController.addAddress() validates fields
      │  AddressService.addAddress() saves to database
      │  Returns AddressDTO
      ▼
6. Frontend calls fetchAddresses() to refresh the list
      │  GET /api/address → returns updated list
      ▼
7. New address appears in AddressList
```

### Selecting Address for Delivery

```
1. User sees list of saved addresses
      │
2. User clicks on an address card
      │  onSelect(a.id) → setSelectedId(a.id)
      │  Card gets green border (.selected class)
      ▼
3. User clicks "Continue to Payment"
      │  navigate('/payment')
      │  The selectedId is used in payment flow
      ▼
4. CheckoutPage / PaymentSelect receives the address
      │  Passes selectedAddressId to payment pages via location.state
```

### Setting Default Address

```
1. User clicks "Set Default" on an address card
      ▼
2. handleSetDefault(id) sends:
      PUT /api/address/{id} with { ...currentAddress, isDefault: true }
      ▼
3. Backend AddressService:
      a. Finds current default → sets isDefault = false → saves
      b. Updates clicked address → sets isDefault = true → saves
      ▼
4. Frontend calls fetchAddresses() → list refreshes
      The new default shows "Default" badge
```

---

## 🧪 Testing

### With cURL

```bash
# 1. Login first to get JWT token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. Add a new address
curl -X POST http://localhost:8080/api/address \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "streetAddress": "123 Main Street",
    "addressLine1": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India",
    "phone": "9876543210",
    "isDefault": true
  }'

# 3. Get all addresses
curl http://localhost:8080/api/address \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Update an address
curl -X PUT http://localhost:8080/api/address/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","streetAddress":"456 New Street","city":"Delhi","state":"Delhi","postalCode":"110001","phone":"9876543210","isDefault":false}'

# 5. Delete an address
curl -X DELETE http://localhost:8080/api/address/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧠 Key Concepts for Beginners

### 1. What is a DTO (Data Transfer Object)?
A DTO is a simple Java class used to **transfer data** between layers. It's different from an Entity:
- **Entity** = maps to a database table (has `@Entity`, `@Table`, `@Id`)
- **DTO** = a plain object sent in API responses (no database annotations)

Why not just send the Entity? Because:
- Entities may have fields you don't want exposed (like timestamps)
- Entities may have circular references (address → user → addresses → ...) causing infinite JSON
- DTOs give you control over exactly what the frontend receives

### 2. What is `@RequestHeader("X-User-Id")`?
The API Gateway extracts the `userId` from the JWT token and adds it as a request header:
```
Original request:  Authorization: Bearer eyJhbGci...
                   ↓ API Gateway processes
Modified request:  X-User-Id: 42
                   X-User-Email: john@test.com
                   X-User-Role: ROLE_USER
```
The backend service just reads this header — it doesn't need to decode the JWT itself.

### 3. What is `e.stopPropagation()`?
When you have nested clickable elements (a card with buttons inside), clicking a button triggers both:
- The button's click handler
- The card's click handler (because the click "bubbles up")

`stopPropagation()` says: "Don't let this click event go to the parent."

### 4. What is `window.confirm()`?
A built-in browser function that shows a dialog: "Are you sure?" with OK and Cancel buttons.
- Returns `true` if user clicks OK
- Returns `false` if user clicks Cancel

### 5. What is the `!!` operator?
Converts any value to a boolean:
```javascript
!!undefined  → false
!!null       → false
!!0          → false
!!""         → false
!!true       → true
!!"hello"    → true
!!42         → true
```

---

## ⚡ Quick Reference

| Concept | Value |
|---------|-------|
| Service | Cart-Orders Service (port 8083) |
| Database | cart_orders_db |
| Table | `addresses` |
| Base URL | `/api/address` |
| Required Fields | name, streetAddress, city, state, postalCode, phone |
| Optional Fields | addressLine2, country |
| Phone Format | 10 digits |
| PIN Code Format | 6 digits |
| Default Country | "USA" (backend), "India" (frontend form) |
| Max defaults per user | 1 (old default is automatically un-defaulted) |
