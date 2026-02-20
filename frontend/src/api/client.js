/**
 * frontend/src/api/client.js
 *
 * Central Axios HTTP client used by the frontend to communicate with backend microservices
 * through the API Gateway. This file centralizes cross-cutting concerns so service modules
 * stay small and only declare endpoint paths and payloads.
 *
 * Responsibilities:
 *  - Create a configured axios instance with a `baseURL` and sensible defaults.
 *  - Attach a request interceptor that:
 *      * Adds an Authorization header if an access token exists in localStorage.
 *      * Extracts a numeric user id (from JWT or localStorage) and sets `X-User-Id` header.
 *      * Handles FormData uploads by removing Content-Type so axios can set multipart
 *        boundaries automatically.
 *      * Logs request details via the project's `logger` utility.
 *  - Attach a response interceptor that:
 *      * Logs responses and errors.
 *      * Handles common statuses like 401 (session expired) and 403 (forbidden).
 *
 * Notes and recommendations:
 *  - The current `baseURL` is hard-coded to `http://localhost:8080` (API Gateway). For
 *    production builds switch this to an environment variable (Vite: `import.meta.env.VITE_API_BASE_URL`).
 *  - If you implement token refresh you should queue failed requests while refreshing and
 *    replay them after refresh completes to avoid duplicate flows.
 *  - Keep this file focused on headers/logging/error handling. Service modules should not
 *    reimplement these behaviors.
 */
import axios from "axios";
import logger from "../utils/logger";

// Utility to decode JWT and extract user ID
const extractUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    // Decode JWT payload
    const base64Url = cleanToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(jsonPayload);
    // Prefer explicit numeric fields, fall back to sub if numeric
    if (payload.userId) return payload.userId;
    if (payload.id) return payload.id;
    if (payload.sub && !isNaN(Number(payload.sub))) return Number(payload.sub);
    return null;
  } catch (e) {
    logger.error("Failed to extract user ID from token", e);
    return null;
  }
};

// API Gateway is on port 8080, which routes to microservices
const client = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR - Add token and user ID to every request
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    
    // Add Authorization header if token exists
    if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
      config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      logger.info("🔐 Token added to request", { url: config.url });
    } else {
      delete config.headers.Authorization;
    }
    
    // ALWAYS try to add user ID - from token first, then fallback to localStorage
    let userId = null;
    
    // Try to extract from token if it exists
    if (token && token !== "null" && token !== "undefined") {
      userId = extractUserIdFromToken(token);
    }
    
    // Fallback to stored userId if extraction failed or no token
    if (!userId) {
      const stored = localStorage.getItem("userId");
      if (stored && stored !== "null" && stored !== "undefined") {
        userId = Number(stored);
      }
    }
    
    // ✅ FIX: PROPER VALIDATION OF userId (check for null/undefined, NOT truthiness)
    // This handles case where userId = 0, which is falsy but valid!
    if (userId !== null && userId !== undefined) {
      config.headers["X-User-Id"] = String(userId);
      logger.info("👤 User ID added to request", { userId, url: config.url });
    } else {
      delete config.headers["X-User-Id"];
      logger.warn("⚠️ No User ID available for request", { url: config.url, userId });
    }
  } catch (e) {
    logger.error("Request interceptor error", e);
    delete config.headers.Authorization;
    delete config.headers["X-User-Id"];
  }
  
  // For FormData (file uploads), don't set Content-Type - let axios set multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    logger.info("📁 FormData detected - Content-Type will be set by axios", { url: config.url });
  }
  
  // LOG REQUEST DETAILS
  logger.logApiRequest(config.method.toUpperCase(), config.url, config.headers, config.data);
  
  return config;
});

// RESPONSE INTERCEPTOR - Handle 401 and token refresh
client.interceptors.response.use(
  (res) => {
    logger.logApiResponse(res.config.method.toUpperCase(), res.config.url, res.status, res.data);
    return res;
  },
  (err) => {
    const token = localStorage.getItem("accessToken");
    const isPublicRoute = 
      err.config.url.includes("/medicines") || 
      err.config.url.includes("/batches") ||
      err.config.url.includes("/auth");

    if (err.response && err.response.status === 401) {
      // Only warn if user had a token and it's a protected route
      if (token && token !== "null" && !isPublicRoute) {
        logger.warn("Session expired - 401 Unauthorized", { url: err.config.url });
      }
    }
    
    if (err.response && err.response.status === 403) {
      logger.error("Access Forbidden - 403", { 
        url: err.config.url, 
        headers: err.config.headers,
        status: err.response.status 
      });
    }

    logger.logApiError(
      err.config.method.toUpperCase(),
      err.config.url,
      err.response?.status || "UNKNOWN",
      err
    );
    
    return Promise.reject(err);
  }
);

export default client;