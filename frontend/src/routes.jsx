import React from "react";
import { Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Chatbot from "./pages/Chatbot";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";

// Auth guard component
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "news", element: <News /> },
      {
        path: "dashboard",
        element: <ProtectedRoute element={<Dashboard />} />,
      },
      { path: "chatbot", element: <ProtectedRoute element={<Chatbot />} /> },
      { path: "profile", element: <ProtectedRoute element={<Profile />} /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "*", element: <Navigate to="/auth/login" /> },
    ],
  },
  // Redirect /login to /auth/login for convenience
  { path: "/login", element: <Navigate to="/auth/login" /> },
  { path: "/register", element: <Navigate to="/auth/register" /> },
  {
    path: "/forgot-password",
    element: <Navigate to="/auth/forgot-password" />,
  },

  // 404 route
  { path: "*", element: <NotFound /> },
];

export default routes;
