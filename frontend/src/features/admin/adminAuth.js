/**
 * adminAuth.js
 * Synchronized with Backend JWT and AdminLoginPage
 */

export const isAdminAuthenticated = () => {
  // Check for the keys we set in AdminLoginPage
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  // User is authenticated only if token exists AND role is ROLE_ADMIN
  return token !== null && role === "ROLE_ADMIN";
};

export const logoutAdmin = () => {
  // Clear only the admin-related items
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("adminEmail"); // If you saved it
  
  // Or use localStorage.clear() if you want to wipe everything
};