# 09 — Analytics & Reports

## 📌 What This Feature Does

The Analytics feature provides the admin dashboard with **charts, statistics, and reports**:

1. **Dashboard** (`/admin/dashboard`) — Real-time stats cards, line charts, bar charts, and pie charts showing revenue, orders, and top products
2. **Reports** (`/admin/reports`) — Generate Sales, Inventory, or Compliance reports for a date range, preview them in a table, and export as CSV

> **Important:** The Analytics Service backend currently returns **hardcoded mock data**. It doesn't read from any real database. The frontend handles this gracefully — it maps whatever data comes back into charts. This is a common pattern during development.

---

## 🏗️ Architecture Overview

```
Admin opens /admin/dashboard
        │
        ▼
┌─────────────────────────┐
│  Dashboard.jsx          │
│  ┌─────────────────────┐│
│  │ StatCard × 4        ││  ← Summary numbers (orders, revenue, etc.)
│  │ LineChart            ││  ← Revenue over time (Recharts)
│  │ BarChart             ││  ← Sales & revenue bars
│  │ PieChart             ││  ← Top products by quantity
│  │ Polling (15s)        ││  ← Auto-refresh every 15 seconds
│  │ SSE Stream           ││  ← Real-time push updates
│  └─────────────────────┘│
└─────────┬───────────────┘
          │  HTTP calls via analyticsService
          ▼
┌─────────────────────────┐
│   API Gateway (8080)    │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Analytics Service      │  (port 8085)
│  AnalyticsController    │  → Returns hardcoded mock data
│  ReportController       │  → Returns mock report data
└─────────────────────────┘
```

---

## 📂 File Map

### Backend (Analytics Service — port 8085)

| File | Purpose |
|------|---------|
| `analytics-service/.../controller/AnalyticsController.java` | Dashboard & sales endpoints (mock data) |
| `analytics-service/.../controller/ReportController.java` | Report generation endpoints (mock data) |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/api/analyticsService.js` | API calls (analyticsService + reportService) |
| `frontend/src/features/admin/analyticsSecction/Dashboard.jsx` | Dashboard page with charts |
| `frontend/src/features/admin/analyticsSecction/StatCard.jsx` | Reusable stat card component |
| `frontend/src/features/admin/analyticsSecction/Reports.jsx` | Reports page |

---

## 🔧 Backend — AnalyticsController (Mock Data)

The entire backend returns **hardcoded values** — no database queries:

```java
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalOrders", 150);          // Always returns 150
        dashboard.put("totalRevenue", 15000.0);     // Always returns 15000
        dashboard.put("totalCustomers", 75);
        dashboard.put("avgOrderValue", 100.0);
        dashboard.put("medicinesInStock", 250);
        dashboard.put("lowStockMedicines", 12);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam(required = false) String period) {
        Map<String, Object> report = new HashMap<>();
        report.put("period", period != null ? period : "monthly");
        report.put("totalSales", 15000.0);
        report.put("totalOrders", 150);
        report.put("avgOrderValue", 100.0);
        report.put("topMedicines", new String[]{"Aspirin", "Ibuprofen", "Paracetamol"});
        return ResponseEntity.ok(report);
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalMedicines", 250);
        report.put("lowStockMedicines", 12);
        report.put("outOfStockMedicines", 5);
        report.put("expiringBatches", 8);
        return ResponseEntity.ok(report);
    }
}
```

**Why mock data?** This service is a placeholder. In production, you'd:
1. Query the `cart_orders_db` for real order/revenue data
2. Query `admin_catalogue_db` for inventory data
3. Aggregate with SQL `GROUP BY`, `SUM`, `COUNT`
4. Cache results with Redis/Spring Cache

---

## 🎨 Frontend — Analytics API Service

```javascript
// frontend/src/api/analyticsService.js

export const analyticsService = {
    // Summary stats (total orders, revenue, users)
    getSummary: async () => {
        const response = await client.get("/api/analytics/summary");
        return response.data;
    },

    // Revenue over time (for line/bar charts)
    getRevenueTimeseries: async (days = 365) => {
        const response = await client.get("/api/analytics/revenue-timeseries", {
            params: { days },
        });
        return response.data;
        // Expected: [{ date: "2024-01-15", revenue: 5000 }, ...]
    },

    // Orders over time
    getOrdersTimeseries: async (days = 30) => {
        const response = await client.get("/api/analytics/orders-timeseries", {
            params: { days },
        });
        return response.data;
        // Expected: [{ date: "2024-01-15", orders: 12 }, ...]
    },

    // Top selling products
    getTopProducts: async (limit = 6) => {
        const response = await client.get("/api/analytics/top-products", {
            params: { limit },
        });
        return response.data;
        // Expected: [{ name: "Aspirin", quantity: 50 }, ...]
    },

    // Subscribe to Server-Sent Events (SSE) for real-time updates
    subscribeToStream: (onMessage, onError) => {
        const eventSource = new EventSource("/api/analytics/stream");
        eventSource.onmessage = onMessage;
        eventSource.onerror = onError;
        return eventSource;  // Caller must close when done
    },
};

export const reportService = {
    getReports: async () => { ... },              // GET /api/reports
    generateSalesReport: async (params) => { ... },      // POST /api/reports/sales
    generateInventoryReport: async (params) => { ... },  // POST /api/reports/inventory
    generateComplianceReport: async (params) => { ... }, // POST /api/reports/compliance
    exportReport: async (id, format) => { ... },         // GET /api/reports/{id}/export
    deleteReport: async (id) => { ... },                 // DELETE /api/reports/{id}
};
```

---

## 🎨 Frontend — Dashboard Page

### Data Fetching Strategy

The dashboard uses **two data-fetching strategies simultaneously**:

#### 1. Polling (every 15 seconds)

```javascript
useEffect(() => {
    fetchAnalytics();  // Initial fetch
    
    const id = setInterval(() => {
        fetchAnalytics();  // Re-fetch every 15 seconds
    }, 15000);
    
    return () => clearInterval(id);  // Cleanup on unmount
}, []);
```

#### 2. Server-Sent Events (SSE)

```javascript
useEffect(() => {
    const es = analyticsService.subscribeToStream(
        (e) => {
            const data = JSON.parse(e.data);
            if (data.event === 'user_created') {
                // Increment real-time counter without full refetch
                realTimeNewUsersRef.current += 1;
                setRealTimeNewUsers(realTimeNewUsersRef.current);
            } else {
                fetchAnalytics();  // Full refresh for other events
            }
        },
        () => console.warn('EventSource error')
    );
    
    return () => es.close();  // Cleanup
}, []);
```

**What is SSE?** Server-Sent Events is a one-way communication channel where the server can push data to the client. Unlike WebSockets (bidirectional), SSE is simpler — the server sends events and the client listens. Uses the browser's `EventSource` API.

### Parallel Data Fetching with `Promise.allSettled`

```javascript
async function fetchAnalytics() {
    const results = await Promise.allSettled([
        analyticsService.getSummary(),           // Call 1
        analyticsService.getRevenueTimeseries(365), // Call 2
        analyticsService.getOrdersTimeseries(30),   // Call 3
        analyticsService.getTopProducts(6)          // Call 4
    ]);

    // Extract results (even if some failed)
    const summaryRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const timeseriesRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const ordersRes = results[2].status === 'fulfilled' ? results[2].value : null;
    const topRes = results[3].status === 'fulfilled' ? results[3].value : null;
}
```

**Why `Promise.allSettled` instead of `Promise.all`?**
- `Promise.all` — If ANY promise rejects, ALL results are lost
- `Promise.allSettled` — Returns status for each promise individually. Even if the summary API fails, you still get timeseries data

### Chart Time Ranges

Users can switch between Weekly / Monthly / Yearly views:

```javascript
const [statRange, setStatRange] = useState("yearly");    // For stats chart
const [salesRange, setSalesRange] = useState("yearly");  // For sales chart
```

The data is **aggregated differently** based on the selected range:

```javascript
const yearlyStatsData = useMemo(() => {
    if (statRange === "yearly") {
        // Group timeseries by month
        const byMonth = {};
        times.forEach(t => {
            const m = new Date(t.date).toLocaleString(undefined, { month: 'short' });
            byMonth[m] = (byMonth[m] || 0) + (t.revenue || 0);
        });
        return Object.keys(byMonth).map(m => ({ label: m, value: byMonth[m] }));
    }

    if (statRange === "monthly") {
        // Group into 4 weekly buckets
        const buckets = [0, 0, 0, 0];
        times.slice(-30).forEach((t, idx) => {
            buckets[Math.floor((idx / 30) * 4)] += (t.revenue || 0);
        });
        return buckets.map((v, i) => ({ label: `W${i+1}`, value: v }));
    }

    // Weekly: use last 7 data points
    return times.slice(-7).map(d => ({ label: d.date, value: d.revenue }));
}, [statRange, analyticsData]);
```

**What is `useMemo`?** A React hook that "remembers" a computed value. It only recalculates when its dependencies (`[statRange, analyticsData]`) change. Without it, the aggregation would run on every re-render (wasteful).

### Recharts — The Charting Library

```jsx
import {
    LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
```

**Line Chart example:**
```jsx
<ResponsiveContainer width="100%" height={250}>
    <LineChart data={weeklyPerformanceData}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#10b981" />
    </LineChart>
</ResponsiveContainer>
```

**Key components:**
- `ResponsiveContainer` — Makes the chart resize with its parent
- `XAxis dataKey="day"` — Uses the `day` field for the horizontal axis
- `Line dataKey="revenue"` — Plots the `revenue` field as the line
- `Tooltip` — Shows values on hover
- `Cell` — Used in PieChart to color each slice differently

### Indian Rupee Formatting

```javascript
const formatRupee = (v) => {
    const n = Number(v) || 0;
    return `₹${n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};
// formatRupee(1234567.89) → "₹12,34,567.89"  (Indian notation)
```

---

## 🎨 Frontend — Reports Page

### Report Types

| Type | Endpoint | What It Shows |
|------|----------|---------------|
| Sales | `POST /api/reports/sales` | Orders, revenue, top products |
| Inventory | `POST /api/reports/inventory` | Stock levels, expiring batches |
| Compliance | `POST /api/reports/compliance` | Regulatory compliance data |

### Generate Flow

```javascript
const handleGenerate = async () => {
    if (!startDate || !endDate) {
        setErrorMessage("Please select both start and end dates.");
        return;
    }

    const params = { startDate, endDate };
    let res;
    
    if (reportType === 'Sales') {
        res = await reportService.generateSalesReport(params);
        // Preview the top revenue rows
        setPreview({
            type: 'Sales',
            summary: { newOrders: res.newOrders, newUsers: res.newUsers, totalIncome: res.totalIncome },
            rows: res.topRevenue?.slice(0, 5) || []
        });
    } else if (reportType === 'Inventory') {
        res = await reportService.generateInventoryReport(params);
        setPreview({ type: 'Inventory', rows: res.slice(0, 5) });
    }
};
```

### CSV Export (Client-Side)

```javascript
const handleExportCSV = (data) => {
    // Build CSV string
    const csvContent = [
        Object.keys(data[0]).join(","),              // Header row: "name,quantity,revenue"
        ...data.map((row) => Object.values(row).join(","))  // Data rows: "Aspirin,50,5000"
    ].join("\n");

    // Create a downloadable file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    link.click();
};
```

**How this works:**
1. Convert data array to CSV text string
2. Create a `Blob` (binary large object) from the text
3. Create a temporary URL for the blob
4. Create a hidden `<a>` link pointing to that URL
5. Programmatically "click" the link → browser downloads the file

---

## 🧠 Key Concepts for Beginners

### 1. What is `useRef`?
A React hook that holds a **mutable value that doesn't cause re-renders**:
```javascript
const realTimeNewUsersRef = useRef(0);

// Updating ref does NOT trigger re-render:
realTimeNewUsersRef.current += 1;

// Updating state DOES trigger re-render:
setRealTimeNewUsers(realTimeNewUsersRef.current);
```
Used for values that change frequently (like real-time counters) where you want to batch UI updates.

### 2. What is `isMounted.current`?
Prevents "state update on unmounted component" warnings:
```javascript
const isMounted = useRef(true);

useEffect(() => {
    isMounted.current = true;
    
    return () => { isMounted.current = false; };  // Set false when component unmounts
}, []);

// In async code:
if (!isMounted.current) return;  // Don't update state if page was closed
```

### 3. What is EventSource (SSE)?
```javascript
const es = new EventSource("/api/analytics/stream");
es.onmessage = (event) => {
    console.log(event.data);  // Server pushes data here
};
es.close();  // Stop listening
```
Unlike fetch (client pulls), SSE lets the server push data whenever something happens. The connection stays open.

### 4. What is `Promise.allSettled`?
```javascript
const results = await Promise.allSettled([
    fetch("/api/a"),  // Succeeds
    fetch("/api/b"),  // Fails!
    fetch("/api/c"),  // Succeeds
]);
// results[0] = { status: "fulfilled", value: Response }
// results[1] = { status: "rejected", reason: Error }
// results[2] = { status: "fulfilled", value: Response }
```
You get ALL results, even if some fail. `Promise.all` would throw on the first failure.

### 5. What is `Blob`?
A **Binary Large Object** — a chunk of data that can be downloaded as a file:
```javascript
const blob = new Blob(["Hello, World!"], { type: "text/plain" });
const url = URL.createObjectURL(blob);
// url = "blob:http://localhost:5173/abc-123-def"
// This URL can be used as an href for download
```

---

## ⚡ Quick Reference

| Concept | Value |
|---------|-------|
| Service Port | 8085 |
| Database | analytics_db (not actively used — mock data) |
| Dashboard URL | `/admin/dashboard` |
| Reports URL | `/admin/reports` |
| Polling Interval | 15 seconds |
| Charting Library | Recharts |
| Report Types | Sales, Inventory, Compliance |
| Export Format | CSV (client-side generation) |
| Real-time Updates | SSE (EventSource) + Polling fallback |
| Data Source | **Hardcoded mock data** (placeholder) |
