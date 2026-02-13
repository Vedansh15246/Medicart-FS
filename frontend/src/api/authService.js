import client from "./client";

// ============ AUTH SERVICE ============
// Routes through API Gateway to Auth Service (port 8081)

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await client.post("/auth/login", { email, password });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    // send only the fields the backend expects to avoid unknown-property failures
    const payload = {
      email: userData.email?.trim() || "",
      password: userData.password?.trim() || "",
      fullName: userData.fullName?.trim() || "",
      phone: String(userData.phone).trim() || "", // Ensure phone is a string
    };
    const response = await client.post("/auth/register", payload);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await client.get("/auth/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await client.put(`/auth/users/${userId}`, profileData);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await client.get("/auth/users");
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await client.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    delete client.defaults.headers.common["Authorization"];
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await client.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password - check email & send OTP
  forgotPassword: async (email) => {
    const response = await client.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Verify forgot-password OTP
  verifyForgotPasswordOtp: async (email, otp) => {
    const response = await client.post("/auth/forgot-password/verify-otp", {
      email,
      otp,
    });
    return response.data;
  },

  // Reset password with email + new password
  resetPassword: async (email, newPassword) => {
    const response = await client.post("/auth/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
