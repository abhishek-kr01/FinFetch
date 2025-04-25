import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();

  // Check if user is already authenticated (token exists)
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token by getting current user profile
      const userData = await authApi.getCurrentUser();

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Invalid token
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);

    try {
      const data = await authApi.login(email, password);

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setUser({
          id: data.user_id,
          email: data.email,
          username: data.username,
        });
        setIsAuthenticated(true);
        toast.success("Login successful!");
        navigate("/dashboard");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.detail || "Login failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);

    try {
      const data = await authApi.register(userData);

      if (data) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    toast.info("You have been logged out.");
    navigate("/login");
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    setLoading(true);
    setAuthError(null);

    try {
      await authApi.requestPasswordReset(email);
      toast.success(
        "If your email exists in our system, you will receive a password reset link."
      );
      return true;
    } catch (error) {
      console.error("Password reset request error:", error);
      // Show generic message for security reasons
      toast.info(
        "If your email exists in our system, you will receive a password reset link."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);

    try {
      const updatedUser = await authApi.updateUser(userData);

      if (updatedUser) {
        setUser(updatedUser);
        toast.success("Profile updated successfully!");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    isAuthenticated,
    loading,
    authError,
    login,
    register,
    logout,
    requestPasswordReset,
    updateProfile,
    clearAuthError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
