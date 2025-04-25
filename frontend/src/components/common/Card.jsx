import React from "react";
import "../../styles/components/common/Card.css";

const Card = ({
  children,
  title,
  subtitle,
  icon,
  className = "",
  headerAction,
  loading = false,
  ...props
}) => {
  const cardClass = `card ${className} ${loading ? "card-loading" : ""}`;

  return (
    <div className={cardClass} {...props}>
      {(title || subtitle || icon || headerAction) && (
        <div className="card-header">
          <div className="card-header-left">
            {icon && <div className="card-icon">{icon}</div>}
            <div className="card-titles">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerAction && (
            <div className="card-header-action">{headerAction}</div>
          )}
        </div>
      )}

      <div className="card-content">
        {loading ? (
          <div className="card-loading-indicator">
            <div className="spinner">
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default Card;
