import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FaStar, FaRegStar, FaChartArea } from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import Card from "../common/Card";
import LoadingIndicator from "../common/LoadingIndicator";
import "../../styles/components/dashboard/StockChart.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = () => {
  const {
    selectedSymbol,
    stockData,
    historicalData,
    loading,
    timeframe,
    setTimeframe,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useStock();

  const [chartData, setChartData] = useState(null);
  const [toggleWatchlistLoading, setToggleWatchlistLoading] = useState(false);

  // Format historical data for chart display
  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      // Sort data by date
      const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Determine timeframe limits
      let filteredData = sortedData;
      const now = new Date();

      if (timeframe === "1D") {
        // For 1D, take last 24 hours
        filteredData = sortedData.filter((item) => {
          const date = new Date(item.date);
          return now.getTime() - date.getTime() <= 24 * 60 * 60 * 1000;
        });
      } else if (timeframe === "1W") {
        // For 1W, take last 7 days
        filteredData = sortedData.filter((item) => {
          const date = new Date(item.date);
          return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
        });
      } else if (timeframe === "1M") {
        // For 1M, take last 30 days
        filteredData = sortedData.filter((item) => {
          const date = new Date(item.date);
          return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
      } else if (timeframe === "3M") {
        // For 3M, take last 90 days
        filteredData = sortedData.filter((item) => {
          const date = new Date(item.date);
          return now.getTime() - date.getTime() <= 90 * 24 * 60 * 60 * 1000;
        });
      } else if (timeframe === "1Y") {
        // For 1Y, take last 365 days
        filteredData = sortedData.filter((item) => {
          const date = new Date(item.date);
          return now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000;
        });
      }

      // If filtered data is empty, use full data
      if (filteredData.length === 0) {
        filteredData = sortedData;
      }

      // Format dates for display
      const labels = filteredData.map((item) => {
        const date = new Date(item.date);

        if (timeframe === "1D") {
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (timeframe === "1W" || timeframe === "1M") {
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        } else {
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      });

      // Get closing prices
      const prices = filteredData.map((item) => item.close || item.price);

      // Determine line color based on trend
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const isPositive = lastPrice >= firstPrice;

      // Create chart data
      setChartData({
        labels,
        datasets: [
          {
            label: selectedSymbol,
            data: prices,
            borderColor: isPositive ? "rgb(76, 175, 80)" : "rgb(244, 67, 54)",
            backgroundColor: isPositive
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(244, 67, 54, 0.1)",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHitRadius: 10,
            tension: 0.3,
            fill: "origin",
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }, [historicalData, selectedSymbol, timeframe]);

  // Handle timeframe selection
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    setToggleWatchlistLoading(true);

    try {
      if (isInWatchlist(selectedSymbol)) {
        await removeFromWatchlist(selectedSymbol);
      } else {
        await addToWatchlist(selectedSymbol);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setToggleWatchlistLoading(false);
    }
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            return `${selectedSymbol}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          color: "var(--text-secondary)",
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => `$${value.toFixed(2)}`,
          color: "var(--text-secondary)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    animation: {
      duration: 1000,
    },
  };

  // Render watchlist button
  const renderWatchlistButton = () => {
    const inWatchlist = isInWatchlist(selectedSymbol);

    return (
      <button
        className={`watchlist-button ${inWatchlist ? "in-watchlist" : ""}`}
        onClick={handleWatchlistToggle}
        disabled={toggleWatchlistLoading}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {toggleWatchlistLoading ? (
          <LoadingIndicator size="small" message="" />
        ) : inWatchlist ? (
          <>
            <FaStar /> Watchlist
          </>
        ) : (
          <>
            <FaRegStar /> Add to Watchlist
          </>
        )}
      </button>
    );
  };

  // Get current price info
  const price = stockData?.price;
  const change = stockData?.change;
  const changePercent = stockData?.change_percent;

  // Calculate if positive change
  const isPositive = change > 0;

  // Render header action with watchlist button
  const headerAction = renderWatchlistButton();

  return (
    <Card
      title={selectedSymbol}
      subtitle={stockData?.name || "Stock Chart"}
      icon={<FaChartArea />}
      headerAction={headerAction}
      loading={loading}
      className="stock-chart-card"
    >
      <div className="chart-price-info">
        <div className="current-price">${price?.toFixed(2) || "0.00"}</div>
        <div className={`price-change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "+" : ""}
          {change?.toFixed(2) || "0.00"} ({changePercent?.toFixed(2) || "0.00"}
          %)
        </div>
      </div>

      <div className="chart-timeframe-controls">
        <div className="timeframe-buttons">
          <button
            className={`timeframe-button ${timeframe === "1D" ? "active" : ""}`}
            onClick={() => handleTimeframeChange("1D")}
          >
            1D
          </button>
          <button
            className={`timeframe-button ${timeframe === "1W" ? "active" : ""}`}
            onClick={() => handleTimeframeChange("1W")}
          >
            1W
          </button>
          <button
            className={`timeframe-button ${timeframe === "1M" ? "active" : ""}`}
            onClick={() => handleTimeframeChange("1M")}
          >
            1M
          </button>
          <button
            className={`timeframe-button ${timeframe === "3M" ? "active" : ""}`}
            onClick={() => handleTimeframeChange("3M")}
          >
            3M
          </button>
          <button
            className={`timeframe-button ${timeframe === "1Y" ? "active" : ""}`}
            onClick={() => handleTimeframeChange("1Y")}
          >
            1Y
          </button>
          <button
            className={`timeframe-button ${
              timeframe === "ALL" ? "active" : ""
            }`}
            onClick={() => handleTimeframeChange("ALL")}
          >
            ALL
          </button>
        </div>
      </div>

      <div className="chart-container">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="no-chart-data">
            <p>No historical data available for {selectedSymbol}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StockChart;
