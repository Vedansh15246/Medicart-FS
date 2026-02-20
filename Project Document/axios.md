## Axios

### What is Axios?

Axios is a popular promise-based HTTP client for JavaScript that runs both in the browser and in Node.js. It provides a small, consistent API for making HTTP requests (GET, POST, PUT, DELETE, etc.), with built-in features like request/response interceptors, automatic JSON serialization/deserialization, request cancellation, and easier header management compared to the native fetch API.

### Why we use Axios in this project

- Promise-based API makes async request handling straightforward (async/await).  
- Interceptors let us centrally attach authentication headers and user metadata to every request and handle response errors in one place.  
- Axios handles JSON automatically and can be configured to treat multipart/form-data correctly (useful for file uploads).  
- A single configured instance (client) allows us to set a `baseURL` (the API Gateway) so service modules only specify route paths.

### Contract (how the client behaves)

- Base URL: `http://localhost:8080` (the API Gateway in development).  
- Adds `Authorization` header (Bearer token) when `accessToken` exists in `localStorage`.  
- Extracts user id from JWT (or `localStorage.userId`) and adds `X-User-Id` header to requests when available.  
- For `FormData` payloads, it removes the `Content-Type` header and lets Axios set the multipart boundary.  
- Logs request and response details via the project's `logger` utility.  
- Response interceptor logs and handles 401/403 statuses (warns on expired session, logs forbidden access).

These behaviors are implemented in: `frontend/src/api/client.js`.

### How we use Axios in the codebase

1. A single configured axios instance is exported from `frontend/src/api/client.js`.
2. All frontend service modules import that client and call HTTP methods on it. Example:

- `frontend/src/api/authService.js` imports `client` and calls `client.post('/auth/login', payload)`.
- Other services using the client include `analyticsService.js`, `catalogService.js`, `orderService.js`, and `paymentService.js`.

This pattern keeps service files small and focused on routes/payloads while centralizing cross-cutting concerns (auth header, user id header, logging, error handling) in `client.js`.

### Where Axios is used in this project

Key files referencing the axios client:

- `frontend/src/api/client.js` — the configured axios instance and interceptors.  
- `frontend/src/api/authService.js` — login, register, profile, logout, and auth operations.  
- `frontend/src/api/analyticsService.js` — analytics endpoints.  
- `frontend/src/api/catalogService.js` — medicine/catalog endpoints.  
- `frontend/src/api/orderService.js` — order and cart endpoints.  
- `frontend/src/api/paymentService.js` — payment endpoints.  

Search tip: look for `import client from "./client"` in `frontend/src/api` to find all consumers.

### Practical notes & tips

- Production base URL: replace the hard-coded `baseURL` in `client.js` with an environment variable (Vite uses `import.meta.env.VITE_API_BASE_URL`).  
- Token refresh: the current client logs 401s; if you add token refresh you should implement a queue to replay failed requests after refresh.  
- When logging out, clear the token from `localStorage` and from `client.defaults.headers.common['Authorization']` (see `authService.logout`).  
- For file uploads, create a `FormData` instance and pass it to the appropriate service method; `client` will allow axios to set the correct `Content-Type` boundary.

### Quick example (login + protected request)

1. Login (authService): call `const { accessToken } = await authService.login(email, password); localStorage.setItem('accessToken', accessToken);`  
2. Subsequent requests made via the `client` will automatically include `Authorization: Bearer <token>` and `X-User-Id`.

---

File created to document axios usage and how the project integrates a single shared axios client across the frontend services.
