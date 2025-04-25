import React from "react";
import { Link } from "react-router-dom";
import "../../styles/components/common/Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  to,
  className = "",
  ...props
}) => {
  const buttonClass = `
    button 
    button-${variant} 
    button-${size} 
    ${fullWidth ? "button-full-width" : ""} 
    ${loading ? "button-loading" : ""} 
    ${className}
  `;

  // Loading indicator
  const loadingIndicator = loading && (
    <span className="button-spinner">
      <span className="spinner-dot"></span>
      <span className="spinner-dot"></span>
      <span className="spinner-dot"></span>
    </span>
  );

  // If "to" prop is provided, render as Link
  if (to) {
    return (
      <Link to={to} className={buttonClass} {...props}>
        {loading ? loadingIndicator : children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? loadingIndicator : children}
    </button>
  );
};

export default Button;
