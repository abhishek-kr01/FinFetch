# FinFetch - Professional Financial Analysis Platform

FinFetch is a comprehensive financial analysis platform that provides real-time stock tracking, AI-powered financial insights, and market news aggregation. This full-stack application combines a modern React frontend with a robust FastAPI backend and MongoDB database to deliver a professional-grade financial toolset.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [MongoDB Setup](#mongodb-setup)
- [Configuration](#-configuration)
  - [Environment Variables](#environment-variables)
  - [API Keys](#api-keys)
- [Usage](#-usage)
  - [Running in Development](#running-in-development)
  - [Production Deployment](#production-deployment)
- [API Documentation](#-api-documentation)
- [Frontend Components](#-frontend-components)
- [Data Flow](#-data-flow)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

FinFetch offers a comprehensive suite of financial tools and features:

### 🔐 User Authentication & Management

- Secure account creation and login
- JWT-based authentication
- User profile management
- Password reset functionality

### 📊 Real-time Stock Tracking

- Interactive stock price charts with multiple timeframes (1D, 1W, 1M, 3M, 1Y, ALL)
- Real-time stock quotes with price updates
- Historical price data visualization
- Comprehensive financial metrics and company information
- Personal watchlist creation and management

### 🤖 AI Financial Assistant

- AI-powered financial chatbot for answering investment questions
- Context-aware responses with stock data integration
- Conversation history and session management
- Multi-stock context for comparative analysis

### 📰 Financial News Aggregation

- Real-time financial news from premium RSS feeds
- Category-based news filtering (Market, Stocks, Economy, Crypto)
- News search functionality
- Stock-specific news integration
- Sentiment analysis for news articles

### 📱 Responsive Design

- Full mobile responsiveness across all pages
- Adaptive layouts for different screen sizes
- Touch-friendly interface
- Cross-browser compatibility

### 🎨 Customization

- Dark/Light theme toggle
- Personalized watchlists
- Customizable dashboard

## 🔧 Technology Stack

### Backend

- **FastAPI**: High-performance, modern Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Motor**: Asynchronous MongoDB driver
- **PyJWT**: JSON Web Token implementation
- **Google Generative AI**: AI-powered financial assistant
- **Pydantic**: Data validation and settings management
- **Feedparser**: RSS feed parsing for news sources
- **HTTPX**: Asynchronous HTTP client for API calls

### Frontend

- **React**: Frontend UI library
- **Vite**: Next-generation frontend tooling
- **React Router**: Client-side routing
- **Chart.js**: Interactive financial charts
- **Axios**: Promise-based HTTP client
- **React-Icons**: Icon components library
- **React-Toastify**: Toast notifications
- **CSS Variables**: For theming and customization

### External APIs

- **Financial Modeling Prep (FMP)**: Stock price data, company profiles
- **Finnhub**: Real-time quotes, company news, financials
- **Various Financial News RSS Feeds**: CNBC, Yahoo Finance, MarketWatch, etc.

## 🏗️ System Architecture

FinFetch follows a modern, modular architecture pattern:

```
┌────────────────┐     ┌───────────────┐     ┌────────────────┐
│                │     │               │     │                │
│   React        │◄───►│   FastAPI     │◄───►│   MongoDB      │
│   Frontend     │     │   Backend     │     │   Database     │
│                │     │               │     │                │
└────────────────┘     └───────┬───────┘     └────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │                    │
                    │   External APIs    │
                    │   & RSS Feeds      │
                    │                    │
                    └────────────────────┘
```

The application is structured with:

- **Clear Separation of Concerns**: Backend, frontend, and database layers are decoupled
- **RESTful API Design**: Predictable, resource-oriented URLs and standard HTTP methods
- **Component-Based Architecture**: Reusable React components
- **Asynchronous Processing**: Non-blocking I/O operations throughout the stack
- **Data Caching Strategy**: Optimized data fetching and storage to minimize external API calls

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8+
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/abhishek-kr01/FinFetch.git
   cd financial-app
   ```

2. Set up a Python virtual environment:

   ```bash
   cd backend
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory (see Configuration section for details)

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (see Configuration section for details)

### MongoDB Setup

1. Install MongoDB Community Edition from the [official website](https://www.mongodb.com/try/download/community).

2. Start MongoDB service:

   ```bash
   # On Windows (as a service)
   # MongoDB should start automatically after installation

   # On macOS (with Homebrew)
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod
   ```

3. Create a database for the project:
   ```bash
   mongosh
   > use financial_app
   > exit
   ```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```
# App settings
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# JWT settings
JWT_SECRET_KEY=your_secret_key_change_this_in_production
JWT_ALGORITHM=HS256

# MongoDB settings
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=financial_app

# External API keys
FMP_API_KEY=your_fmp_api_key
FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key

# Logging settings
LOG_LEVEL=INFO
```

#### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEFAULT_STOCK=IBM
```

### API Keys

To use all features of FinFetch, you'll need to obtain API keys from:

1. **Financial Modeling Prep (FMP)**:

   - Register at [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs/)
   - Add your key to the `FMP_API_KEY` environment variable

2. **Finnhub**:

   - Register at [Finnhub](https://finnhub.io/)
   - Add your key to the `FINNHUB_API_KEY` environment variable

3. **Google Generative AI (For Gemini)**:
   - Get API key from [Google AI Studio](https://makersuite.google.com/)
   - Add your key to the `GEMINI_API_KEY` environment variable

## 🖥️ Usage

### Running in Development

#### Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The FastAPI backend will be available at http://localhost:8000. API documentation can be accessed at http://localhost:8000/docs.

#### Frontend

```bash
cd frontend
npm run dev
```

The React frontend will be available at http://localhost:5173.

### Production Deployment

#### Backend

For production deployment, it's recommended to use Gunicorn with Uvicorn workers:

```bash
pip install gunicorn
cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

You may also want to set up a reverse proxy with Nginx.

#### Frontend

Build the frontend for production:

```bash
cd frontend
npm run build
```

This will create a `dist` directory with optimized static files that can be served with Nginx or any other static file server.

## 📘 API Documentation

The FastAPI backend automatically generates interactive API documentation at `/docs` endpoint. The main API routes include:

### Authentication

- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `POST /api/auth/password-reset` - Request password reset
- `GET /api/auth/me` - Get current user information

### Stocks

- `GET /api/stocks/quotes/{symbol}` - Get real-time quote for a stock
- `POST /api/stocks/quotes/batch` - Get quotes for multiple stocks
- `POST /api/stocks/historical` - Get historical price data
- `GET /api/stocks/financials/{symbol}` - Get financial metrics
- `POST /api/stocks/search` - Search for stocks
- `GET /api/stocks/popular` - Get popular/trending stocks
- `GET /api/stocks/watchlist` - Get user's watchlist
- `PUT /api/stocks/watchlist` - Update watchlist
- `POST /api/stocks/watchlist/{symbol}` - Add to watchlist
- `DELETE /api/stocks/watchlist/{symbol}` - Remove from watchlist

### News

- `GET /api/news/latest` - Get latest financial news
- `POST /api/news/search` - Search news articles
- `POST /api/news/filter` - Filter news by category
- `POST /api/news/by-symbols` - Get news for specific stocks
- `GET /api/news/trending` - Get trending financial news
- `GET /api/news/categories` - Get available news categories

### Chatbot

- `POST /api/chatbot/chat` - Send message to AI assistant
- `GET /api/chatbot/history/{session_id}` - Get chat history
- `GET /api/chatbot/sessions` - Get user's chat sessions
- `POST /api/chatbot/sessions` - Create a new chat session
- `PUT /api/chatbot/sessions/{session_id}` - Update a chat session
- `DELETE /api/chatbot/sessions/{session_id}` - Delete a chat session

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `PUT /api/users/me/watchlist` - Update user watchlist
- `DELETE /api/users/me` - Delete user account

## 🧩 Frontend Components

The frontend is structured with reusable components:

### Layout Components

- `MainLayout` - Primary layout for most pages
- `AuthLayout` - Layout for authentication pages

### Common Components

- `Button` - Customizable button component
- `Card` - Container for content blocks
- `Header` - Site navigation header
- `Footer` - Site footer
- `LoadingIndicator` - Loading spinner
- `Logo` - Application logo
- `SearchBar` - Stock search component

### Dashboard Components

- `StockChart` - Interactive price chart
- `StockInfo` - Company and financial information
- `StockNews` - Company-specific news
- `Watchlist` - User's saved stocks
- `MarketOverview` - Popular stocks display

### Authentication Components

- `LoginForm` - User login
- `RegisterForm` - New account creation
- `ForgotPasswordForm` - Password reset

### Chatbot Components

- `ChatInterface` - AI assistant interface
- `ChatMessage` - Individual message display
- `SymbolPicker` - Stock context selector

### News Components

- `NewsCard` - Individual news article
- `NewsFilters` - Category filters
- `NewsSearch` - Search functionality

## 📊 Data Flow

FinFetch implements a sophisticated data flow to provide real-time financial information while minimizing external API calls:

1. **Client Request**: User requests stock data via frontend
2. **API Router**: Backend API endpoint receives request
3. **Database Check**: System checks MongoDB for recent data
4. **Data Freshness Check**: System verifies if cached data is still valid
   - Stock quotes: 5 minutes
   - Financial metrics: 24 hours
   - News articles: Stored indefinitely but refreshed periodically
5. **External API Call**: If data is stale or not found, system calls external APIs
6. **Data Storage**: Fresh data is stored in MongoDB
7. **Response**: Data is returned to frontend
8. **Rendering**: Frontend renders data in appropriate components

This approach balances real-time data with efficient resource usage and API rate limit considerations.

## 💾 Database Schema

FinFetch uses MongoDB with the following collections:

### User Collections

#### users

```json
{
  "_id": ObjectId,
  "email": String (unique),
  "username": String (unique),
  "password": String (hashed),
  "first_name": String (optional),
  "last_name": String (optional),
  "created_at": DateTime,
  "updated_at": DateTime,
  "is_active": Boolean
}
```

#### watchlists

```json
{
  "_id": ObjectId,
  "user_id": String,
  "symbols": Array<String>,
  "updated_at": DateTime
}
```

### Financial Data Collections

#### stock_quotes

```json
{
  "_id": ObjectId,
  "symbol": String,
  "price": Number,
  "change": Number,
  "change_percent": Number,
  "volume": Number,
  "market_cap": Number,
  "pe_ratio": Number,
  "timestamp": DateTime
}
```

#### stock_prices

```json
{
  "_id": ObjectId,
  "symbol": String,
  "date": DateTime,
  "open": Number,
  "high": Number,
  "low": Number,
  "close": Number,
  "volume": Number,
  "created_at": DateTime
}
```

#### stock_financials

```json
{
  "_id": ObjectId,
  "symbol": String,
  "company_name": String,
  "sector": String,
  "industry": String,
  "market_cap": Number,
  "pe_ratio": Number,
  "eps": Number,
  "dividend_yield": Number,
  "revenue": Number,
  "revenue_growth": Number,
  "profit_margin": Number,
  "debt_to_equity": Number,
  "price_to_book": Number,
  "rsi": Number,
  "beta": Number,
  "fifty_day_ma": Number,
  "two_hundred_day_ma": Number,
  "timestamp": DateTime
}
```

### News Collection

#### news

```json
{
  "_id": ObjectId,
  "headline": String,
  "summary": String,
  "source": String,
  "date": DateTime,
  "url": String,
  "image": String (optional),
  "symbol": String (optional),
  "category": String,
  "sentiment": {
    "score": Number,
    "label": String
  },
  "created_at": DateTime
}
```

### Chatbot Collections

#### chat_sessions

```json
{
  "_id": ObjectId,
  "user_id": String,
  "title": String,
  "context": Object,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### chat_messages

```json
{
  "_id": ObjectId,
  "user_id": String,
  "session_id": String,
  "content": String,
  "is_user": Boolean,
  "timestamp": DateTime
}
```

## 🤝 Contributing

Contributions to FinFetch are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

### Development Guidelines

- Use async/await for all database operations
- Write docstrings for all functions and classes
- Follow PEP 8 style guide for Python code
- Use functional components and hooks for React components
- Write unit tests for new functionality

## 🙏 Acknowledgments

FinFetch makes use of the following open-source projects and APIs:

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Chart.js](https://www.chartjs.org/)
- [Financial Modeling Prep API](https://financialmodelingprep.com/)
- [Finnhub API](https://finnhub.io/)
- [Google Generative AI](https://ai.google.dev/)

---
