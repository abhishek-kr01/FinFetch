import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaNewspaper,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";
import newsApi from "../api/newsApi";
import Card from "../components/common/Card";
import LoadingIndicator from "../components/common/LoadingIndicator";
import Button from "../components/common/Button";
import "../styles/pages/News.css";

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredNews, setFilteredNews] = useState([])
  // Categories for filtering
  const categories = [
    { id: "all", name: "All News" },
    { id: "market", name: "Market" },
    { id: "stocks", name: "Stocks" },
    { id: "economy", name: "Economy" },
    { id: "business", name: "Business" },
    { id: "crypto", name: "Crypto" },
  ];

  // Fetch news on initial load
  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news data
  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await newsApi.getLatestNews(30);
      console.log(data)
      console.log("hi")
      setNewsItems(data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news. Please try again.");

  //     // Set mock data for development/demo
      setNewsItems(generateMockNews());
    } finally {
      // setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Search news when search term is entered
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      const results = await newsApi.searchNews(searchTerm);
      setNewsItems(results);
      setActiveCategory("all");
    } catch (error) {
      console.error("Error searching news:", error);
      setError("Failed to search news. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // const fetchNews = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:8000/api/news/"); // update if hosted elsewhere
  //     const data = response.data;

  //     // Transform the API response
  //     const transformed = Object.entries(data).flatMap(([source, feed]) =>
  //       (feed.news || []).map((article, index) => ({
  //         _id: `${source}-${index}`,
  //         image: article.thumbnail || null,
  //         source: feed.feed_title || source,
  //         date: article.published || "N/A",
  //         headline: article.title,
  //         summary: article.summary || "", // optional
  //         url: article.link
  //       }))
  //     );
  //     // const filteredNews = transformed
  //     setFilteredNews(transformed);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch news.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Filter news based on active category
  
    

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

  // Generate mock news for development/demo
  const generateMockNews = () => {
    const currentDate = new Date();

    return [
      {
        _id: "1",
        headline: "S&P 500 reaches new all-time high amid tech rally",
        summary:
          "The S&P 500 reached a new all-time high today, driven by strong performances in technology stocks following positive earnings reports.",
        source: "Wall Street Journal",
        date: currentDate,
        url: "#",
        image: "https://via.placeholder.com/800x400?text=Markets",
      },
      {
        _id: "2",
        headline: "Federal Reserve signals potential rate cut in September",
        summary:
          "The Federal Reserve has signaled that it may cut interest rates in September, citing concerns about global economic growth and trade uncertainties.",
        source: "CNBC",
        date: new Date(currentDate.getTime() - 86400000), // Yesterday
        url: "#",
        image: "https://via.placeholder.com/800x400?text=FederalReserve",
      },
      {
        _id: "3",
        headline:
          "Bitcoin breaks $60,000 barrier as institutional adoption grows",
        summary:
          "Bitcoin has surpassed $60,000 as more institutional investors add the cryptocurrency to their portfolios, signaling growing mainstream acceptance.",
        source: "CoinDesk",
        date: new Date(currentDate.getTime() - 172800000), // 2 days ago
        url: "#",
        image: "https://via.placeholder.com/800x400?text=Crypto",
      },
      {
        _id: "4",
        headline: "Tesla stock surges 8% following strong quarterly earnings",
        summary:
          "Tesla shares jumped 8% after the company reported stronger-than-expected earnings and revenue growth, driven by record vehicle deliveries.",
        source: "Bloomberg",
        date: new Date(currentDate.getTime() - 259200000), // 3 days ago
        url: "#",
        image: "https://via.placeholder.com/800x400?text=Tesla",
      },
      {
        _id: "5",
        headline: "Apple announces new product line at annual conference",
        summary:
          "Apple unveiled several new products at its annual conference, including the next generation iPhone and updates to its Mac lineup.",
        source: "The Verge",
        date: new Date(currentDate.getTime() - 345600000), // 4 days ago
        url: "#",
        image: "https://via.placeholder.com/800x400?text=Apple",
      },
      {
        _id: "6",
        headline:
          "US unemployment rate falls to 3.9% as job market remains resilient",
        summary:
          "The latest Labor Department report shows the US unemployment rate dropped to 3.9%, indicating continued strength in the labor market despite economic challenges.",
        source: "Reuters",
        date: new Date(currentDate.getTime() - 432000000), // 5 days ago
        url: "#",
        image: "https://via.placeholder.com/800x400?text=Economy",
      },
    ];
  };

  return (
    <div className="news-page">
      <div className="container">
        <div className="news-header">
          <h1>Financial News</h1>

          <div className="news-controls">
            <form onSubmit={handleSearchSubmit} className="news-search">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={clearSearch}
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

            <Button
              variant="outline"
              size="small"
              className="filter-toggle"
              onClick={toggleFilters}
            >
              <FaFilter /> Filters
            </Button>
          </div>
        </div>

        <div className={`news-filters ${showFilters ? "show" : ""}`}>
          <div className="filter-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-tab ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="news-loading">
            <LoadingIndicator message="Loading financial news..." />
          </div>
        ) : error ? (
          <div className="news-error">
            <p>{error}</p>
            <Button onClick={fetchNews} variant="primary">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {searchTerm && (
              <div className="search-results-header">
                <h2>Search Results for "{searchTerm}"</h2>
                <Button variant="outline" size="small" onClick={clearSearch}>
                  Clear Search
                </Button>
              </div>
            )}

            {newsItems.length > 0 ? (
              <div className="news-grid">
                {newsItems.map((article) => (
                  <Card key={article._id} className="news-card">
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
                          {formatDate(article.date)}
                        </span>
                      </div>
                      <h3 className="news-headline">{article.headline}</h3>
                      {article.summary && (
                        <p className="news-summary">{article.summary}</p>
                      )}
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
                ))}
              </div>
            ) : (
              <div className="no-news-found">
                <FaNewspaper className="no-news-icon" />
                <h2>No news found</h2>
                <p>
                  {searchTerm
                    ? `No results found for "${searchTerm}"`
                    : "No news articles available for this category"}
                </p>
                <Button onClick={fetchNews} variant="primary">
                  View All News
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
