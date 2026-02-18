import logger from "./logger";

/**
 * Decode JWT token and extract payload
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    
    // Decode JWT payload (base64url)
    const base64Url = cleanToken.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    logger.error("Failed to decode JWT token", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - true if expired, false if still valid
 */
export const isTokenExpired = (token) => {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      logger.warn("Token has no expiration field");
      return true; // Treat as expired if no exp field
    }
    
    // JWT exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    
    if (isExpired) {
      logger.warn("🔴 Token has expired", {
        expiredAt: new Date(payload.exp * 1000).toISOString(),
        currentTime: new Date(currentTime * 1000).toISOString()
      });
    } else {
      const timeLeft = payload.exp - currentTime;
      logger.info("🟢 Token is still valid", {
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        timeLeftSeconds: timeLeft,
        timeLeftMinutes: Math.floor(timeLeft / 60)
      });
    }
    
    return isExpired;
  } catch (error) {
    logger.error("Error checking token expiration", error);
    return true; // Treat as expired on error
  }
};

/**
 * Get time remaining until token expires (in seconds)
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - currentTime;
    
    return Math.max(0, timeLeft);
  } catch (error) {
    return 0;
  }
};

/**
 * Extract user information from token
 */
export const getUserFromToken = (token) => {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    return {
      userId: payload.userId || payload.id || payload.sub,
      username: payload.sub || payload.username,
      email: payload.email,
      role: payload.role || payload.authorities?.[0],
      exp: payload.exp,
      iat: payload.iat
    };
  } catch (error) {
    logger.error("Error extracting user from token", error);
    return null;
  }
};
