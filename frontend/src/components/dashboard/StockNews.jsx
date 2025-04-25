import React from "react";
import { FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";
import { useStock } from "../../context/StockContext";
import Card from "../common/Card";
import "../../styles/components/dashboard/StockNews.css";

const StockNews = () => {
  const { selectedSymbol, newsData, loading } = useStock();

  // Format publication date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // If the date is today, show time
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      // If the date is yesterday, show "Yesterday"
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      // Otherwise show date
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card
      title={`${selectedSymbol} Recent News`}
      icon={<FaNewspaper />}
      loading={loading}
      className="stock-news-card"
    >
      {newsData && newsData.length > 0 ? (
        <div className="news-list">
          {newsData.map((item, index) => (
            <div key={index} className="news-item">
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">
                  {formatDate(item.date || item.datetime)}
                </span>
              </div>
              <h3 className="news-headline">{item.headline}</h3>
              {item.summary && (
                <div className="news-summary">{item.summary}</div>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  Read More <FaExternalLinkAlt />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-news">
          <p>No recent news found for {selectedSymbol}</p>
        </div>
      )}
    </Card>
  );
};

export default StockNews;
