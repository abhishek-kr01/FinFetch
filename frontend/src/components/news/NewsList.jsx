import React from "react";
import { FaNewspaper } from "react-icons/fa";
import NewsCard from "./NewsCard";
import Button from "../common/Button";
import LoadingIndicator from "../common/LoadingIndicator";
import "../../styles/components/news/NewsList.css";

const NewsList = ({
  news,
  loading,
  error,
  searchTerm,
  onClearSearch,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className="news-loading">
        <LoadingIndicator message="Loading financial news..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-error">
        <p>{error}</p>
        <Button onClick={onRefresh} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="no-news-found">
        <FaNewspaper className="no-news-icon" />
        <h2>No news found</h2>
        <p>
          {searchTerm
            ? `No results found for "${searchTerm}"`
            : "No news articles available for this category"}
        </p>
        <Button onClick={onRefresh} variant="primary">
          View All News
        </Button>
      </div>
    );
  }

  return (
    <>
      {searchTerm && (
        <div className="search-results-header">
          <h2>Search Results for "{searchTerm}"</h2>
          <Button variant="outline" size="small" onClick={onClearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      <div className="news-grid">
        {news.map((article) => (
          <NewsCard key={article._id || article.id} article={article} />
        ))}
      </div>
    </>
  );
};

export default NewsList;
