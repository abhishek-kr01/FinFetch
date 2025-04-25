import React from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import Button from "../common/Button";
import "../../styles/components/news/NewsFilter.css";

const NewsFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
  showFilters,
  toggleFilters,
}) => {
  return (
    <div className="news-filter-container">
      <Button
        variant="outline"
        size="small"
        className="filter-toggle"
        onClick={toggleFilters}
      >
        {showFilters ? <FaTimes /> : <FaFilter />} Filters
      </Button>

      <div className={`news-filters ${showFilters ? "show" : ""}`}>
        <div className="filter-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-tab ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFilter;
