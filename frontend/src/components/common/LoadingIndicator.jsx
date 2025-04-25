import React from "react";
import "../../styles/components/common/LoadingIndicator.css";

const LoadingIndicator = ({
  size = "medium",
  fullPage = false,
  message = "Loading...",
}) => {
  const containerClass = `loading-indicator ${fullPage ? "full-page" : ""}`;
  const spinnerClass = `spinner spinner-${size}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
