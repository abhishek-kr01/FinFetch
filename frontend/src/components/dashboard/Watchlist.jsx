import React, { useEffect, useState } from "react";
import {
  FaList,
  FaStar,
  FaTrash,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import Button from "../common/Button";
import stockApi from "../../api/stockApi";
import "../../styles/components/dashboard/Watchlist.css";

const Watchlist = () => {
  const { watchlist, changeStock, removeFromWatchlist, selectedSymbol } =
    useStock();
  const { isAuthenticated } = useAuth();
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data for watchlist items
  useEffect(() => {
    const fetchWatchlistData = async () => {
      if (!watchlist || watchlist.length === 0) {
        setWatchlistData([]);
        return;
      }

      setLoading(true);

      try {
        const data = await stockApi.getBatchQuotes(watchlist);

        // Sort by symbol
        const sortedData = data.sort((a, b) =>
          a.symbol.localeCompare(b.symbol)
        );

        setWatchlistData(sortedData);
      } catch (error) {
        console.error("Error fetching watchlist data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistData();
  }, [watchlist]);

  // Handle click on watchlist item
  const handleSelectStock = (symbol) => {
    changeStock(symbol);
  };

  // Handle remove from watchlist
  const handleRemoveFromWatchlist = async (e, symbol) => {
    e.stopPropagation();

    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error);
    }
  };

  return (
    <Card
      title="Watchlist"
      icon={<FaList />}
      loading={loading}
      className="watchlist-card"
    >
      {isAuthenticated ? (
        watchlist && watchlist.length > 0 ? (
          <div className="watchlist-items">
            {watchlistData.map((item) => (
              <div
                key={item.symbol}
                className={`watchlist-item ${
                  selectedSymbol === item.symbol ? "active" : ""
                }`}
                onClick={() => handleSelectStock(item.symbol)}
              >
                <div className="watchlist-item-symbol">
                  <FaStar className="watchlist-star" />
                  <span>{item.symbol}</span>
                </div>
                <div className="watchlist-item-price">
                  ${item.price?.toFixed(2) || "0.00"}
                </div>
                <div
                  className={`watchlist-item-change ${
                    item.change_percent >= 0 ? "positive" : "negative"
                  }`}
                >
                  {item.change_percent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {item.change_percent?.toFixed(2) || "0.00"}%
                </div>
                <button
                  className="watchlist-remove-btn"
                  onClick={(e) => handleRemoveFromWatchlist(e, item.symbol)}
                  aria-label={`Remove ${item.symbol} from watchlist`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-watchlist">
            <div className="empty-watchlist-icon">
              <FaStar />
            </div>
            <h3>Your watchlist is empty</h3>
            <p>Add stocks to your watchlist to track them here</p>
            <div className="watchlist-hint">
              <FaChartLine /> Tip: Click the star icon on any stock chart to add
              it to your watchlist
            </div>
          </div>
        )
      ) : (
        <div className="login-prompt">
          <h3>Track Your Favorite Stocks</h3>
          <p>Sign in to create and manage your watchlist</p>
          <Button to="/login" variant="primary">
            Sign In
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Watchlist;
