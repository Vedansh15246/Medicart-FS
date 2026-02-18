/**
 * adminAuth.js
 * Synchronized with Backend JWT and AdminLoginPage
 */

import { isTokenExpired } from "../../utils/jwtUtils";
import logger from "../../utils/logger";

export const isAdminAuthenticated = () => {
  // Check for the keys we set in AdminLoginPage
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  // First check if token and role exist
  if (!token || role !== "ROLE_ADMIN") {
    return false;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    logger.warn("🔴 Admin token expired - logging out");
    logoutAdmin();
    return false;
  }

  // User is authenticated only if token exists AND role is ROLE_ADMIN AND token is not expired
  return true;
};

export const logoutAdmin = () => {
  // Clear only the admin-related items
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("adminEmail"); // If you saved it
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  
  logger.info("🚪 Admin logged out - cleared all auth data");
  
  // Or use localStorage.clear() if you want to wipe everything
};