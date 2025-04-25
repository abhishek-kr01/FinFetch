import React, { useEffect } from "react";
import { FaSync, FaClock } from "react-icons/fa";
import { useStock } from "../context/StockContext";
import LoadingIndicator from "../components/common/LoadingIndicator";
import Button from "../components/common/Button";
import StockChart from "../components/dashboard/StockChart";
import StockInfo from "../components/dashboard/StockInfo";
import StockNews from "../components/dashboard/StockNews";
import Watchlist from "../components/dashboard/Watchlist";
import MarketOverview from "../components/dashboard/MarketOverview";
import "../styles/pages/Dashboard.css";

const Dashboard = () => {
  const { selectedSymbol, loading, error, refreshStockData, lastUpdated } =
    useStock();

  // Format date for display
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";

    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refreshStockData();
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Financial Dashboard</h1>
          <div className="dashboard-controls">
            <div className="last-updated">
              <FaClock /> Last updated: {formatLastUpdated()}
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={handleRefresh}
              loading={loading}
              disabled={loading}
            >
              <FaSync /> Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="dashboard-error">
            <p>{error}</p>
            <Button onClick={handleRefresh} variant="primary">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="dashboard-chart-section">
                <StockChart />
              </div>

              <div className="dashboard-info-section">
                <StockInfo />
              </div>

              <div className="dashboard-news-section">
                <StockNews />
              </div>
            </div>

            <div className="dashboard-sidebar">
              <div className="dashboard-watchlist-section">
                <Watchlist />
              </div>

              <div className="dashboard-market-section">
                <MarketOverview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
