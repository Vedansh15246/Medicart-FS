# Analytics & Dashboard End-to-End Flow

This document describes how the **Admin Analytics Dashboard** in the frontend pulls data from the backend services, how data flows across microservices, and how authentication is passed through the API Gateway.

## Scope

- **Frontend:** Admin Analytics Dashboard UI, hooks, and API client
- **Backend:** `analytics-service` + downstream `cart-orders-service`, `auth-service`, and `admin-catalogue-service`
- **Security:** `Authorization` bearer token + `X-User-Id` propagation
- **APIs:** All endpoints used by the analytics dashboard and reports

---

## Frontend Architecture

### Key files

- `frontend/src/features/admin/analyticsSection/pages/Dashboard.jsx`
  - Orchestrates analytics data fetching and chart/table rendering.
- `frontend/src/features/admin/analyticsSection/analyticsApi.js`
  - Typed, centralized API calls for analytics and report endpoints.
- `frontend/src/api/client.js`
  - Axios client with request/response interceptors (adds auth headers).
- Chart components
  - `RevenueChartCard.jsx`
  - `OrdersChartCard.jsx`
  - `CategoryPieCard.jsx`
  - `TopProductsTable.jsx`

### Hooks used and why

In `Dashboard.jsx` the following hooks are used:

- `useState`
  - Stores view state such as ranges, summary data, chart series, and table data.
  - Rationale: keeps UI reactive to API responses and range changes without reloading the page.
- `useEffect`
  - Triggers data load on mount and when range selectors change.
  - Sets and clears polling interval (refresh every 30 seconds).
  - Rationale: handles side effects (API calls + timers) at the right lifecycle moments.
- `useCallback`
  - Memoizes async loaders (`loadDashboardData`, `loadRevenueSeries`, `loadOrderSeries`).
  - Rationale: avoids re-creating functions each render, which prevents unnecessary effects re-running.
- `useMemo`
  - Transforms backend payloads into chart/table-ready formats.
  - Aggregates top-3 categories + “Others” for the pie chart.
  - Rationale: prevents expensive data transforms on every render when inputs are unchanged.
- `useRef`
  - `isMounted` guard to prevent state updates after unmount.
  - Rationale: avoids memory leaks and React warnings when async responses resolve after unmount.

### Frontend data flow (Dashboard)

1. **Dashboard mounts** → `useEffect` triggers `loadDashboardData()`
2. `loadDashboardData()` calls in parallel:
   - `fetchAnalyticsSummary()`
   - `fetchSalesByCategory()`
   - `fetchTopProducts(6)`
3. `useMemo` transforms data to:
   - `yearlyStatsData` for line chart
   - `ordersData` for bar chart
   - `pieData` for donut chart (top 3 + Others)
4. Charts and table render from derived props.

### API client + security (frontend)

All analytics API calls use the shared Axios client in `frontend/src/api/client.js`.

**Request interceptor behavior:**

- Reads `accessToken` from `localStorage`.
- Adds `Authorization: Bearer <token>` header when present.
- Extracts user ID from JWT (payload fields: `userId`, `id`, or numeric `sub`).
- Adds `X-User-Id: <id>` header when available.

This means **every analytics request** sent from the frontend includes:

- `Authorization` (JWT bearer token)
- `X-User-Id` (numeric ID derived from token or localStorage fallback)

---

## Backend Architecture

### Primary service

- **analytics-service** (`microservices/analytics-service`)
  - Exposes `/api/admin/analytics/**` endpoints.
  - Aggregates data from multiple microservices via Feign clients.

### Downstream services

- **cart-orders-service**
  - Source of revenue, order counts, order series, top products, and sales-by-category (order-based).
- **auth-service**
  - Source of user counts.
- **admin-catalogue-service**
  - Fallback source for sales-by-category if order-based data is empty.

---

## Backend Data Flow (Analytics)

### 1) Summary endpoint

`GET /api/admin/analytics/summary`

- Controller: `AnalyticsController#getSummary`
- Service: `AnalyticsService#getSummary`
- Feign calls:
  - `auth-service` → user counts
  - `cart-orders-service` → order counts + revenue

### 2) Top products

`GET /api/admin/analytics/top-products`

- Controller: `AnalyticsController#getTopProducts`
- Service: `AnalyticsService#getTopProducts`
- Feign call:
  - `cart-orders-service /api/analytics/top-products`

### 3) Sales by category

`GET /api/admin/analytics/sales-by-category`

- Controller: `AnalyticsController#getSalesByCategory`
- Service: `AnalyticsService#getSalesByCategory`
- Primary source:
  - `cart-orders-service /api/analytics/sales-by-category` (order-based revenue)
- Fallback source:
  - `admin-catalogue-service /api/analytics/sales-by-category`

### 4) Order status distribution

`GET /api/admin/analytics/order-status-distribution`

- Controller: `AnalyticsController#getOrderStatusDistribution`
- Service: `AnalyticsService#getOrderStatusDistribution`
- Feign call:
  - `cart-orders-service /api/analytics/order-status-distribution`

### 5) Series endpoints (line/bar charts)

`GET /api/admin/analytics/order-series?range=weekly|monthly|yearly|daily`

`GET /api/admin/analytics/revenue-series?range=weekly|monthly|yearly|daily`

- Controller: `AnalyticsController#getOrderSeries` / `getRevenueSeries`
- Service: `AnalyticsService#getOrderSeries` / `getRevenueSeries`
- Feign calls:
  - `cart-orders-service /api/analytics/order-series`
  - `cart-orders-service /api/analytics/revenue-series`

---

## API Gateway and Security Flow

### Gateway

- Frontend uses **API Gateway** at `http://localhost:8080`.
- Gateway routes to microservices internally.

### Auth propagation

From `frontend/src/api/client.js`:

- `Authorization` header is passed to the gateway.
- `X-User-Id` header is added for endpoints that need user context.

This allows backend services (cart-orders, analytics, etc.) to validate identity or apply access control.

---

## Frontend APIs Used (Analytics + Reports)

From `frontend/src/features/admin/analyticsSection/analyticsApi.js`:

### Analytics

- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/sales-by-category`
- `GET /api/admin/analytics/top-products?limit=6`
- `GET /api/admin/analytics/order-status-distribution`
- `GET /api/admin/analytics/revenue-series?range=weekly|monthly|yearly|daily`
- `GET /api/admin/analytics/order-series?range=weekly|monthly|yearly|daily`

### Reports

- `GET /api/admin/reports/list`
- `DELETE /api/admin/reports/{id}`
- `GET /api/admin/reports/sales?startDate&endDate`
- `GET /api/admin/reports/inventory`
- `GET /api/admin/reports/user-activity?startDate&endDate`

---

## Frontend Chart Inputs

- **Line Chart (Revenue)**
  - Source: `fetchRevenueSeries(range)`
  - Shape: `{ label, value }`
- **Bar Chart (Orders)**
  - Source: `fetchOrderSeries(range)`
  - Shape: `{ label, orders }`
- **Pie Chart (Category)**
  - Source: `fetchSalesByCategory()`
  - Transformation: top 3 categories + “Others”

---

## Troubleshooting Notes

- If the pie chart shows empty data, verify:
  - `cart-orders-service` returns non-empty `/api/analytics/sales-by-category`.
  - If empty, verify fallback `/api/analytics/sales-by-category` in `admin-catalogue-service` has batch data (quantity_total, selling_price).
- If requests fail with 401/403:
  - Confirm `accessToken` exists in `localStorage` and is valid.
  - Verify gateway routes and service security configuration.

---

## Related Files (Quick Reference)

Frontend:
- `frontend/src/features/admin/analyticsSection/pages/Dashboard.jsx`
- `frontend/src/features/admin/analyticsSection/analyticsApi.js`
- `frontend/src/api/client.js`

Backend:
- `microservices/analytics-service/src/main/java/com/medicart/analytics/controller/AnalyticsController.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/service/AnalyticsService.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/client/CartOrdersClient.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/client/CatalogueClient.java`
