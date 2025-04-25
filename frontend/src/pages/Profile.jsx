import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignOutAlt,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import "../styles/pages/Profile.css";

const Profile = () => {
  const { user, isAuthenticated, loading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Set initial form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        password: "",
        confirm_password: "",
      });
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Clear success message
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (formData.username.trim() === "") {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation (only if entered)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      }

      // Confirm password validation
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);

    // Prepare data for API
    const updateData = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
    };

    // Only include password if it was entered
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const success = await updateProfile(updateData);

      if (success) {
        setUpdateSuccess(true);
        // Clear password fields
        setFormData({
          ...formData,
          password: "",
          confirm_password: "",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Profile</h1>
        </div>

        <div className="profile-content">
          <Card className="profile-card">
            <div className="profile-avatar">
              <div className="avatar">
                {user?.username ? (
                  user.username.charAt(0).toUpperCase()
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="profile-name">
                {user?.first_name || user?.last_name ? (
                  <h2>{`${user.first_name || ""} ${user.last_name || ""}`}</h2>
                ) : (
                  <h2>{user?.username || "User"}</h2>
                )}
                <p>{user?.email}</p>
              </div>
            </div>

            {updateSuccess && (
              <div className="profile-success">
                <FaCheck /> Profile updated successfully
              </div>
            )}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className={errors.username ? "error" : ""}
                  />
                </div>
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? "error" : ""}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password (leave blank to keep current)
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className={errors.password ? "error" : ""}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className={errors.confirm_password ? "error" : ""}
                  />
                </div>
                {errors.confirm_password && (
                  <div className="error-message">{errors.confirm_password}</div>
                )}
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateLoading}
                  disabled={updateLoading}
                >
                  Update Profile
                </Button>

                <Button type="button" variant="outline" onClick={handleLogout}>
                  <FaSignOutAlt /> Sign Out
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
