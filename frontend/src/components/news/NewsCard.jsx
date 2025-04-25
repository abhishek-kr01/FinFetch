import React from "react";
import { FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";
import Card from "../common/Card";
import "../../styles/components/news/NewsCard.css";

const NewsCard = ({ article }) => {
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
    <Card className="news-card">
      {article.image ? (
        <div className="news-image">
          <img src={article.image} alt={article.headline} />
        </div>
      ) : (
        <div className="news-image news-image-placeholder">
          <FaNewspaper />
        </div>
      )}
      <div className="news-content">
        <div className="news-meta">
          <span className="news-source">{article.source}</span>
          <span className="news-date">
            {formatDate(article.date || article.datetime)}
          </span>
        </div>
        <h3 className="news-headline">{article.headline}</h3>
        {article.summary && <p className="news-summary">{article.summary}</p>}
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-link"
          >
            Read Full Article <FaExternalLinkAlt />
          </a>
        )}
      </div>
    </Card>
  );
};

export default NewsCard;
