import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUserAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import "../../styles/pages/auth/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login, loading, isAuthenticated, authError, clearAuthError } =
    useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    // Clear any previous auth errors
    clearAuthError();
  }, [isAuthenticated, navigate, clearAuthError]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    // Login
    await login(email, password);
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1>Welcome Back</h1>
        <p>Enter your credentials to access your account</p>
      </div>

      {authError && <div className="auth-error">{authError}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="form-input-container">
            <FaEnvelope className="form-input-icon" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={emailError ? "form-input error" : "form-input"}
            />
          </div>
          {emailError && <div className="form-error">{emailError}</div>}
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="form-link">
              Forgot password?
            </Link>
          </div>
          <div className="form-input-container">
            <FaLock className="form-input-icon" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={passwordError ? "form-input error" : "form-input"}
            />
          </div>
          {passwordError && <div className="form-error">{passwordError}</div>}
        </div>

        <div className="form-checkbox">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me">Remember me</label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="auth-form-footer">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="auth-form-link">
            Sign up now
          </Link>
        </p>
      </div>

      <div className="auth-alternates">
        <div className="auth-separator">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons">
          <button className="social-button">
            <FaUserAlt />
            <span>Demo Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
