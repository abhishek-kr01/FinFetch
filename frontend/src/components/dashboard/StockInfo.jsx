import React from "react";
import {
  FaInfoCircle,
  FaBuilding,
  FaGlobe,
  FaDollarSign,
  FaIndustry,
  FaChartLine,
} from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import Card from "../common/Card";
import "../../styles/components/dashboard/StockInfo.css";

const StockInfo = () => {
  const { selectedSymbol, financialData, stockData, loading } = useStock();

  // Format large numbers
  const formatNumber = (num, suffix = "") => {
    if (num === null || num === undefined) return "N/A";

    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T${suffix}`;
    }
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B${suffix}`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M${suffix}`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K${suffix}`;
    }

    return `$${num.toFixed(2)}${suffix}`;
  };

  // Format percentages
  const formatPercent = (num) => {
    if (num === null || num === undefined) return "N/A";
    return `${num.toFixed(2)}%`;
  };

  // Generate info items from financial data
  const getInfoItems = () => {
    const items = [
      {
        icon: <FaBuilding />,
        label: "Company",
        value: financialData?.company_name || "N/A",
      },
      {
        icon: <FaIndustry />,
        label: "Industry",
        value: financialData?.industry || "N/A",
      },
      {
        icon: <FaGlobe />,
        label: "Sector",
        value: financialData?.sector || "N/A",
      },
      {
        icon: <FaDollarSign />,
        label: "Market Cap",
        value: financialData?.market_cap
          ? formatNumber(financialData.market_cap)
          : "N/A",
      },
      {
        icon: <FaChartLine />,
        label: "P/E Ratio",
        value: financialData?.pe_ratio
          ? financialData.pe_ratio.toFixed(2)
          : "N/A",
      },
      {
        icon: <FaDollarSign />,
        label: "EPS",
        value: financialData?.eps ? `$${financialData.eps.toFixed(2)}` : "N/A",
      },
      {
        icon: <FaDollarSign />,
        label: "Dividend Yield",
        value: financialData?.dividend_yield
          ? formatPercent(financialData.dividend_yield)
          : "N/A",
      },
      {
        icon: <FaDollarSign />,
        label: "Revenue",
        value: financialData?.revenue
          ? formatNumber(financialData.revenue)
          : "N/A",
      },
      {
        icon: <FaChartLine />,
        label: "Revenue Growth",
        value: financialData?.revenue_growth
          ? formatPercent(financialData.revenue_growth)
          : "N/A",
      },
      {
        icon: <FaChartLine />,
        label: "Profit Margin",
        value: financialData?.profit_margin
          ? formatPercent(financialData.profit_margin)
          : "N/A",
      },
      {
        icon: <FaChartLine />,
        label: "Debt/Equity",
        value: financialData?.debt_to_equity
          ? financialData.debt_to_equity.toFixed(2)
          : "N/A",
      },
      {
        icon: <FaChartLine />,
        label: "Price/Book",
        value: financialData?.price_to_book
          ? financialData.price_to_book.toFixed(2)
          : "N/A",
      },
    ];

    return items;
  };

  return (
    <Card
      title={`${selectedSymbol} Information`}
      icon={<FaInfoCircle />}
      loading={loading}
      className="stock-info-card"
    >
      <div className="stock-info-grid">
        {getInfoItems().map((item, index) => (
          <div key={index} className="info-item">
            <div className="info-icon">{item.icon}</div>
            <div className="info-content">
              <div className="info-label">{item.label}</div>
              <div className="info-value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StockInfo;
