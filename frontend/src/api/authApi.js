import apiClient from "./apiClient";

const authApi = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Update user profile
  updateUser: async (userData) => {
    try {
      const response = await apiClient.put("/users/me", userData);
      return response.data;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post("/auth/password-reset", { email });
      return response.data;
    } catch (error) {
      console.error("Password reset request error:", error);
      throw error;
    }
  },

  // Update user watchlist
  updateWatchlist: async (symbols) => {
    try {
      const response = await apiClient.put("/users/me/watchlist", symbols);
      return response.data;
    } catch (error) {
      console.error("Update watchlist error:", error);
      throw error;
    }
  },
};

export default authApi;
