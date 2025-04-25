# FinancialPro - Professional Financial Data Platform

FinancialPro is a comprehensive financial data and analysis platform that provides real-time stock tracking, AI-powered financial insights, and market news.

## Features

- **Real-Time Stock Tracking**: Monitor stocks with live data, interactive charts, and comprehensive performance metrics
- **AI Financial Assistant**: Get personalized insights and answers to your financial questions powered by advanced AI
- **Financial News**: Stay updated with the latest market news, company announcements, and economic reports
- **User Authentication**: Secure login/signup system with JWT authentication
- **Watchlist**: Create and manage a personalized list of stocks to track
- **Dashboard**: Interactive dashboard with real-time stock data, charts, and company information
- **Dark Mode**: Support for both light and dark themes

## Technology Stack

### Backend

- FastAPI (Python web framework)
- MongoDB (Database)
- JWT Authentication
- Google Gemini AI for the chatbot
- Financial APIs integration (FMP, Finnhub)

### Frontend

- React with Vite
- React Router for navigation
- Chart.js for data visualization
- Context API for state management
- Vanilla CSS for styling (no frameworks)

## Project Structure

```
financial-app/
├── backend/                      # FastAPI backend
│   ├── app/                      # Application code
│   │   ├── api/                  # API routes
│   │   ├── core/                 # Core functionality
│   │   ├── models/               # Database models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   └── utils/                # Utility functions
│   ├── main.py                   # Entry point
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React+Vite frontend
│   ├── public/                   # Public assets
│   ├── src/                      # Source code
│   │   ├── api/                  # API clients
│   │   ├── components/           # Reusable components
│   │   ├── context/              # Context providers
│   │   ├── pages/                # Application pages
│   │   └── styles/               # CSS styles
│   ├── index.html                # HTML template
│   └── package.json              # npm dependencies
└── README.md                     # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- MongoDB

### Installation

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on `.env.example` and add your API keys and configuration

6. Start the backend server:
   ```bash
   python main.py
   ```

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## API Keys Required

To fully use the application, you'll need to obtain API keys for:

- Financial Modeling Prep (FMP) - https://financialmodelingprep.com/
- Finnhub - https://finnhub.io/
- Google AI (for Gemini) - https://ai.google.dev/

Add these keys to your `.env` files in both backend and frontend directories.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
