import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import "../../styles/components/common/SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { searchStocks, changeStock } = useStock();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length > 1) {
      setLoading(true);

      // Debounce search
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchStocks(value);
          setSearchResults(results.slice(0, 8)); // Limit to 8 results
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setLoading(false);
    }
  };

  // Handle stock selection
  const handleSelectStock = (symbol) => {
    changeStock(symbol);
    setSearchTerm("");
    setShowResults(false);
    navigate("/dashboard");
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length > 1 && setShowResults(true)}
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Loading...</div>
          ) : searchResults.length > 0 ? (
            <ul className="results-list">
              {searchResults.map((stock) => (
                <li key={stock.symbol} className="result-item">
                  <button onClick={() => handleSelectStock(stock.symbol)}>
                    <span className="result-symbol">{stock.symbol}</span>
                    <span className="result-name">{stock.company_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">No stocks found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
