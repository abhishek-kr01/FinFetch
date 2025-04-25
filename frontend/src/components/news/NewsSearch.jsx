import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import Button from "../common/Button";
import "../../styles/components/news/NewsSearch.css";

const NewsSearch = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}) => {
  return (
    <form onSubmit={onSearchSubmit} className="news-search">
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search news..."
          value={searchTerm}
          onChange={onSearchChange}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <Button type="submit" variant="primary" size="small">
        Search
      </Button>
    </form>
  );
};

export default NewsSearch;
