import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaRobot,
  FaNewspaper,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import "../styles/pages/Home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { trendingNews, availableSymbols } = useStock();
  const [featuredStocks, setFeaturedStocks] = useState([]);
  // console.log(trendingNews)
  useEffect(() => {
    // Set featured stocks from available symbols
    if (availableSymbols && availableSymbols.length > 0) {
      // Take first 4 stocks for featured section
      setFeaturedStocks(availableSymbols.slice(0, 4));
    }
  }, [availableSymbols]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">  
            <h1 className="hero-title">
              Smart Financial Analysis at Your Fingertips
            </h1>
            <p className="hero-subtitle">
              Track stocks, analyze financial data, and get AI-powered insights
              all in one platform
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Button to="/dashboard" variant="primary" size="large">
                  Go to Dashboard <FaArrowRight />
                </Button>
              ) : (
                <>
                  <Button to="/register" variant="primary" size="large">
                    Get Started
                  </Button>
                  <Button to="/login" variant="outline" size="large">
                    Sign In
                  </Button>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1M+</span>
                <span className="stat-label">Stock Analyses</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">8,500+</span>
                <span className="stat-label">Companies</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src="/FinFetch.jpg" alt="FinFetch Dashboard" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Tools for Financial Success</h2>
            <p>Everything you need to make informed investment decisions</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Real-Time Stock Tracking</h3>
              <p>
                Monitor stocks with live data, interactive charts, and
                comprehensive performance metrics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaRobot />
              </div>
              <h3>AI Financial Assistant</h3>
              <p>
                Get personalized insights and answers to your financial
                questions powered by advanced AI.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaNewspaper />
              </div>
              <h3>Financial News</h3>
              <p>
                Stay updated with the latest market news, company announcements,
                and economic reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Preview Section */}
      <section className="markets-section">
        <div className="container">
          <div className="section-header">
            <h2>Markets at a Glance</h2>
            <p>Track the performance of popular stocks</p>
          </div>

          <div className="stocks-grid">
            {featuredStocks.map((stock) => (
              <Card key={stock.symbol} className="stock-card">
                <div className="stock-card-header">
                  <div className="stock-symbol">{stock.symbol}</div>
                  <div className="stock-company">{stock.company_name}</div>
                </div>
                <div className="stock-card-price">
                  <div className="price-placeholder"></div>
                  <div className="price-change positive">+2.45%</div>
                </div>
                <Link to="/dashboard" className="stock-card-link">
                  View Details <FaArrowRight />
                </Link>
              </Card>
            ))}
          </div>

          <div className="section-action">
            <Button to="/dashboard" variant="outline">
              View All Markets
            </Button>
          </div>
        </div>
      </section>

      {/* News Preview Section */}
      <section className="news-preview-section">
        <div className="container">
          <div className="section-header">
            <h2>Latest Financial News</h2>
            <p>Stay informed with the most recent market updates</p>
          </div>

          <div className="news-grid">
            {trendingNews.slice(0, 3).map((article, index) => (
              <Card key={index} className="news-card">
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
                      {new Date(article.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="news-headline">{article.headline}</h3>
                  <p className="news-summary">{article.summary}</p>
                  <Link to="/news" className="news-link">
                    Read More <FaArrowRight />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="section-action">
            <Button to="/news" variant="outline">
              View All News
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take Control of Your Financial Future?</h2>
            <p>
              Join thousands of users making informed investment decisions with
              FinFetch
            </p>
            <ul className="cta-features">
              <li>
                <FaCheckCircle /> Real-time market data
              </li>
              <li>
                <FaCheckCircle /> AI-powered financial insights
              </li>
              <li>
                <FaCheckCircle /> Comprehensive stock analysis
              </li>
              <li>
                <FaCheckCircle /> Latest financial news
              </li>
            </ul>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Button to="/dashboard" variant="primary" size="large">
                  Go to Dashboard
                </Button>
              ) : (
                <Button to="/register" variant="primary" size="large">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
