import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaArrowLeft } from "react-icons/fa";
import Button from "../components/common/Button";
import "../styles/pages/NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-icon">
          <FaExclamationTriangle />
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Button to="/" variant="primary">
            <FaHome /> Go to Home
          </Button>
          <Button onClick={() => window.history.back()} variant="outline">
            <FaArrowLeft /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
