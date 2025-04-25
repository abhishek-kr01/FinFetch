import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Protected route component
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="news" element={<News />} />
      </Route>

      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<MainLayout />}>
        <Route
          path="dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="chatbot"
          element={<ProtectedRoute element={<Chatbot />} />}
        />
        <Route
          path="profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
      </Route>

      {/* Not found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
