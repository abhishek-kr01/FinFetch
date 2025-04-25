import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useStock } from "../../context/StockContext";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import "../../styles/components/common/Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useStock();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
  };

  // Determine if we should show the search bar
  const showSearch =
    location.pathname === "/dashboard" || location.pathname === "/news";

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <Logo />
            </Link>

            <nav className={`main-nav ${mobileMenuOpen ? "active" : ""}`}>
              <ul className="nav-list">
                <li className="nav-item">
                  <NavLink to="/" className="nav-link" onClick={closeMenus}>
                    Home
                  </NavLink>
                </li>
                {isAuthenticated && (
                  <li className="nav-item">
                    <NavLink
                      to="/dashboard"
                      className="nav-link"
                      onClick={closeMenus}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink to="/news" className="nav-link" onClick={closeMenus}>
                    News
                  </NavLink>
                </li>
                {isAuthenticated && (
                  <li className="nav-item">
                    <NavLink
                      to="/chatbot"
                      className="nav-link"
                      onClick={closeMenus}
                    >
                      AI Assistant
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <div className="header-right">
            {showSearch && <SearchBar />}

            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {isAuthenticated ? (
              <div className="user-menu-container">
                <button
                  className="user-menu-button"
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  {user?.username ? (
                    <span className="user-initials">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <FaUserCircle />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <p className="user-name">{user?.username || "User"}</p>
                      <p className="user-email">{user?.email || ""}</p>
                    </div>
                    <ul className="user-menu-list">
                      <li>
                        <Link to="/profile" onClick={closeMenus}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard" onClick={closeMenus}>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout}>Logout</button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="button outline">
                  Login
                </Link>
                <Link to="/register" className="button primary">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
