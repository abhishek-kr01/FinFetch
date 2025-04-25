import React, { useState, useEffect } from "react";
import {
  FaGlobeAmericas,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
} from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import Card from "../common/Card";
import stockApi from "../../api/stockApi";
import "../../styles/components/dashboard/MarketOverview.css";

const MarketOverview = () => {
  const { availableSymbols, changeStock } = useStock();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data for popular stocks
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!availableSymbols || availableSymbols.length === 0) {
        return;
      }

      setLoading(true);

      try {
        // Take first 10 stocks
        const popularSymbols = availableSymbols
          .slice(0, 10)
          .map((stock) => stock.symbol);
        const data = await stockApi.getBatchQuotes(popularSymbols);

        // Sort by market cap (descending)
        const sortedData = data.sort(
          (a, b) => (b.market_cap || 0) - (a.market_cap || 0)
        );

        setMarketData(sortedData);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [availableSymbols]);

  // Filter stocks based on search term
  const filteredStocks = marketData.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle stock selection
  const handleSelectStock = (symbol) => {
    changeStock(symbol);
  };

  return (
    <Card
      title="Market Overview"
      icon={<FaGlobeAmericas />}
      loading={loading}
      className="market-overview-card"
    >
      <div className="market-search">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="market-search-input"
          />
        </div>
      </div>

      <div className="market-list">
        <div className="market-list-header">
          <div className="market-cell symbol-cell">Symbol</div>
          <div className="market-cell price-cell">Price</div>
          <div className="market-cell change-cell">Change</div>
          <div className="market-cell action-cell"></div>
        </div>

        <div className="market-list-body">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <div key={stock.symbol} className="market-row">
                <div className="market-cell symbol-cell">
                  <div className="stock-symbol">{stock.symbol}</div>
                </div>
                <div className="market-cell price-cell">
                  ${stock.price?.toFixed(2) || "0.00"}
                </div>
                <div
                  className={`market-cell change-cell ${
                    stock.change_percent >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stock.change_percent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {stock.change_percent?.toFixed(2) || "0.00"}%
                </div>
                <div className="market-cell action-cell">
                  <button
                    className="view-stock-btn"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-stocks-found">
              <p>No stocks found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MarketOverview;
