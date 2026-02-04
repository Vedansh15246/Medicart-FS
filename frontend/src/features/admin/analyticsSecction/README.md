Dashboard (Pharmacy Analytics)

This folder contains the admin dashboard UI for MediCart and the mapping to backend analytics APIs. The dashboard is designed to show real, database-driven analytics (no synthetic data for the current week).

Files
- Dashboard.jsx — main dashboard UI and charts.
- StatCard.jsx — small reusable stat card used on the dashboard.

Key backend APIs used by the dashboard
- GET /api/admin/analytics/summary
  - Returns summary metrics: totalOrders, totalRevenue, ordersToday, revenueToday, ordersThisMonth, revenueThisMonth, newUsers30, avgOrderValue
  - Used to populate stat cards and provide all-time totals.

- GET /api/admin/analytics/revenue-timeseries?days=365
  - Returns a list of { date: 'yyyy-MM-dd', revenue: number } for the last N days (default 30). The dashboard requests 365 days so the yearly chart is accurate.
  - Used to render the "Revenue (Yearly)" line chart.

- GET /api/admin/analytics/orders-timeseries?days=30
  - Returns a list of { date: 'yyyy-MM-dd', orders: number } for the last N days (default 30).
  - Used to render the "Orders (Last 30 days)" bar chart.

- GET /api/admin/analytics/top-products?limit=6
  - Returns a list of top products aggregated by quantity sold.
  - Used for the Top Products leaderboard at the bottom of the dashboard.

Real-time updates
- The backend exposes a Server-Sent Events stream at GET /api/admin/analytics/stream. The frontend subscribes to this stream and will refresh analytics when order/user/report events are emitted by the server.
- Note: EventSource cannot add Authorization headers. If your backend requires a bearer token header for SSE, use cookie-based auth or a token-in-query approach.

Design notes and behavior
- No synthetic data is created for the current week: the backend data initializer intentionally skips seeding orders that fall in the current week.
- Charts will display empty if no data is available; the dashboard avoids fabricating fake values for a more honest view.
- Currency is formatted using the Indian Rupee symbol (₹) for revenue charts and stat cards.

How to run locally
1. Start backend (make sure MySQL is available and application.properties is configured):

```powershell
cd c:\Users\2460680\finalProject\Finalbackend
.\mvnw.cmd -DskipTests=true spring-boot:run
```

2. Start frontend (from the frontend folder). If default port 5173 is in use, set PORT before running:

```powershell
cd c:\Users\2460680\finalProject\Finalbackend\frontend
$env:PORT=5175; npm run dev
```

3. Open the admin dashboard in your browser (e.g., http://localhost:5175/) and log in as an admin. Place test orders via the app to see real-time changes.

Troubleshooting
- If today's orders do not appear in charts, verify that orders are being saved with a correct `orderDate` (LocalDateTime.now()) on the backend and that the database and backend server timezone match the browser's expectations.
- If SSE doesn't connect because of auth, see the SSE authentication note above.

If you'd like, I can:
- Add a small admin route to delete seeded orders that fall in the current week (safe cleanup with backup)
- Convert orders-timeseries to return a full-year view for monthly/yearly aggregations
- Polish the chart colors and responsive layout further (mobile-first)

