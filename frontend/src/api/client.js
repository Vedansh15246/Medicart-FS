import axios from "axios";

// API Gateway is on port 8080, which routes to microservices
const client = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR - Add token to every request
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    
    // Only add Authorization header if token exists and is valid
    if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
      // Ensure token has "Bearer " prefix
      config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      console.log("🔐 Token added to request:", config.url);
    } else {
      // No token, remove Authorization header
      delete config.headers.Authorization;
    }
  } catch (e) {
    console.error("❌ Token error in request interceptor:", e);
    delete config.headers.Authorization;
  }
  return config;
});

// RESPONSE INTERCEPTOR - Handle 401 and token refresh
client.interceptors.response.use(
  (res) => {
    console.log("✅ Response received:", res.status, res.config.url);
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
        console.warn("⚠️ Session expired - 401 Unauthorized on:", err.config.url);
        
        // Optional: Clear token and redirect to login
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("userRole");
        // window.location.href = "/auth/login";
      }
    }
    
    return Promise.reject(err);
  }
);

export default client;