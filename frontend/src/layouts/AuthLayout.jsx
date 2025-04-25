import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useStock } from "../context/StockContext";
import { FaMoon, FaSun } from "react-icons/fa";
import Logo from "../components/common/Logo";
import "../styles/layouts/AuthLayout.css";

const AuthLayout = () => {
  const { darkMode, toggleDarkMode } = useStock();

  return (
    <div className="auth-layout">
      <div className="auth-layout-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <Logo size="medium" />
          </Link>
          <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="auth-content">
          <Outlet />
        </div>

        <div className="auth-footer">
          <p>
            &copy; {new Date().getFullYear()} FinFetch. All rights reserved.
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-quote">
          <h2>
            "The stock market is a device for transferring money from the
            impatient to the patient."
          </h2>
          <p>Warren Buffett</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
