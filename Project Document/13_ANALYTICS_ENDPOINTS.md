# 13 — Analytics & Reports API Endpoints

This document lists **all Dashboard + Reports endpoints** used by the admin UI and **what data each endpoint returns**.

> Base path used by the frontend: `GET /api/admin/analytics/*` and `GET /api/admin/reports/*`

---

## ✅ Dashboard Endpoints (Analytics)

### 1) `GET /api/admin/analytics/summary`
**Purpose:** Returns KPI totals shown in the stat cards (orders, revenue, users).

**Response (AnalyticsSummaryDTO):**
```json
{
  "totalUsers": 1250,
  "usersToday": 12,
  "usersThisWeek": 88,
  "usersThisMonth": 320,
  "usersThisYear": 1250,

  "totalRevenue": 850000.0,
  "revenueToday": 12000.0,
  "revenueThisWeek": 82000.0,
  "revenueThisMonth": 240000.0,
  "revenueThisYear": 850000.0,

  "totalOrders": 920,
  "ordersToday": 18,
  "ordersThisWeek": 110,
  "ordersThisMonth": 420,
  "ordersThisYear": 920,

  "avgOrderValue": 923.75,
  "computedAt": "2026-02-17T11:42:15"
}
```

---

### 2) `GET /api/admin/analytics/top-products?limit=6`
**Purpose:** Top selling products used in the “Top Products” table.

**Response (array):**
```json
[
  {
    "medicineId": 12,
    "medicineName": "Paracetamol",
    "category": "Pain Relief",
    "totalQuantity": 320,
    "totalRevenue": 64000.0
  }
]
```

---

### 3) `GET /api/admin/analytics/sales-by-category`
**Purpose:** Category breakdown for the pie chart.

**Response (array):**
```json
[
  {
    "category": "Pain Relief",
    "totalRevenue": 125000.0
  },
  {
    "category": "Vitamins",
    "totalRevenue": 89000.0
  }
]
```

---

### 4) `GET /api/admin/analytics/order-status-distribution`
**Purpose:** Distribution of order statuses (optional chart/legend).

**Response (object map):**
```json
{
  "PLACED": 120,
  "SHIPPED": 80,
  "DELIVERED": 650,
  "CANCELLED": 12
}
```

---

### 5) `GET /api/admin/analytics/revenue-series?range=weekly`
**Purpose:** Revenue line chart series. Range allowed: `daily`, `weekly`, `monthly`, `yearly`.

**Response (array):**
```json
[
  { "label": "FEB", "value": 52000.0 },
  { "label": "MAR", "value": 61000.0 }
]
```

---

### 6) `GET /api/admin/analytics/order-series?range=weekly`
**Purpose:** Order count series (bar chart). Range allowed: `daily`, `weekly`, `monthly`, `yearly`.

**Response (array):**
```json
[
  { "label": "FEB", "orders": 120 },
  { "label": "MAR", "orders": 145 }
]
```

---

### 7) `POST /api/admin/analytics/refresh`
**Purpose:** Forces analytics refresh across services.

**Response:**
```json
{ "message": "Analytics refreshed" }
```
*(Exact payload depends on the analytics-service implementation.)*

---

## ✅ Reports Endpoints (Reports Page)

### 1) `GET /api/admin/reports/list`
**Purpose:** Returns all generated reports shown in “Recent Logs”.

**Response (array of ReportDTO):**
```json
[
  {
    "id": 12,
    "reportType": "SALES",
    "reportName": "Sales Report: 2026-02-01 to 2026-02-15",
    "startDate": "2026-02-01",
    "endDate": "2026-02-15",
    "reportData": "{...JSON string...}",
    "generatedAt": "2026-02-16T10:22:55"
  }
]
```

---

### 2) `GET /api/admin/reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
**Purpose:** Generates a sales report for a date range.

**Response (ReportDTO):**
```json
{
  "id": 15,
  "reportType": "SALES",
  "reportName": "Sales Report: 2026-02-01 to 2026-02-15",
  "startDate": "2026-02-01",
  "endDate": "2026-02-15",
  "reportData": "{\"startDate\":\"2026-02-01\",\"endDate\":\"2026-02-15\",\"totalOrders\":120,\"totalRevenue\":350000.0,\"avgOrderValue\":2916.67,\"dailySales\":[{\"date\":\"2026-02-01\",\"totalOrders\":8,\"totalRevenue\":22000.0}]}",
  "generatedAt": "2026-02-16T10:22:55"
}
```

**Inside `reportData` (parsed JSON):**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-15",
  "totalOrders": 120,
  "totalRevenue": 350000.0,
  "avgOrderValue": 2916.67,
  "dailySales": [
    { "date": "2026-02-01", "totalOrders": 8, "totalRevenue": 22000.0 }
  ]
}
```

---

### 3) `GET /api/admin/reports/inventory`
**Purpose:** Generates inventory stock report (mock data in analytics-service).

**Response (ReportDTO):**
```json
{
  "id": 18,
  "reportType": "INVENTORY",
  "reportName": "Inventory Report: 2026-02-17",
  "startDate": null,
  "endDate": null,
  "reportData": "{\"totalProducts\":320,\"inStockProducts\":285,\"lowStockProducts\":25,\"outOfStockProducts\":10,\"totalInventoryValue\":850000.0}",
  "generatedAt": "2026-02-17T09:02:11"
}
```

**Inside `reportData` (parsed JSON):**
```json
{
  "totalProducts": 320,
  "inStockProducts": 285,
  "lowStockProducts": 25,
  "outOfStockProducts": 10,
  "totalInventoryValue": 850000.0
}
```

---

### 4) `GET /api/admin/reports/user-activity?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
**Purpose:** Generates user activity report for a date range (mock data in analytics-service).

**Response (ReportDTO):**
```json
{
  "id": 21,
  "reportType": "USER_ACTIVITY",
  "reportName": "User Activity Report: 2026-02-01 to 2026-02-15",
  "startDate": "2026-02-01",
  "endDate": "2026-02-15",
  "reportData": "{\"totalUsers\":1250,\"activeUsers\":890,\"newRegistrations\":120,\"averageOrdersPerUser\":3.2,\"topUserSegment\":\"Regular Customers\"}",
  "generatedAt": "2026-02-16T10:24:02"
}
```

**Inside `reportData` (parsed JSON):**
```json
{
  "totalUsers": 1250,
  "activeUsers": 890,
  "newRegistrations": 120,
  "averageOrdersPerUser": 3.2,
  "topUserSegment": "Regular Customers"
}
```

---

### 5) `DELETE /api/admin/reports/{reportId}`
**Purpose:** Deletes a report from history.

**Response:**
```json
{ "deleted": true, "reportId": 15 }
```

---

## 🔍 Notes for Beginners

- **Report responses are wrapped in `ReportDTO`**, and the actual data is a JSON string in `reportData`.
- The frontend parses `reportData` before building the preview table.
- Some report types (inventory + user activity) use **mocked data** generated in the analytics-service.
- Range values for series endpoints: `daily`, `weekly`, `monthly`, `yearly`.
