import React from "react";
import { FaChartLine } from "react-icons/fa";
import "../../styles/components/common/Logo.css";

const Logo = ({ size = "default" }) => {
  const logoClass = `logo logo-${size}`;

  return (
    <div className={logoClass}>
      <FaChartLine className="logo-icon" />
      <span className="logo-text">FinFetch</span>
    </div>
  );
};

export default Logo;
