import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import "../../styles/pages/auth/Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { requestPasswordReset, loading, clearAuthError } = useAuth();

  // Clear any previous auth errors
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      return;
    }

    // Request password reset
    const success = await requestPasswordReset(email);
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1>Reset Password</h1>
        <p>Enter your email address to receive a password reset link</p>
      </div>

      {submitted ? (
        <div className="auth-success">
          <div className="auth-success-icon">
            <FaEnvelope />
          </div>
          <h2>Check your email</h2>
          <p>
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions to reset your password.
          </p>
          <p className="auth-success-small">
            Didn't receive the email? Check your spam folder or request a new
            link.
          </p>
          <div className="auth-success-actions">
            <Button variant="primary" onClick={() => setSubmitted(false)}>
              Request new link
            </Button>
            <Link to="/login" className="auth-success-link">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Reset Password
          </Button>

          <div className="auth-back-link">
            <Link to="/login">
              <FaArrowLeft /> Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
