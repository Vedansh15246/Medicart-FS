import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  userId: null,
  status: "idle", // idle, loading, succeeded, failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user info after successful login/registration
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.status = "succeeded";
      state.error = null;
    },

    // Set loading state
    setLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },

    // Handle login/register error
    setError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Logout user
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.status = "idle";
      state.error = null;
    },

    // Initialize auth from localStorage (on app start)
    initializeAuth: (state) => {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "User";

      if (token && userId) {
        state.token = token;
        state.userId = userId;
        state.user = {
          id: userId,
          name: userName,
          email: localStorage.getItem("userEmail") || "user@medicart.com",
        };
        state.status = "succeeded";
      }
    },

    // Clear auth error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout, initializeAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
