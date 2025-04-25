import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import stockApi from "../api/stockApi";
import newsApi from "../api/newsApi";
import { useAuth } from "./AuthContext";

// Create the context
const StockContext = createContext();

// Custom hook to use the stock context
export const useStock = () => useContext(StockContext);

// Provider component
export const StockProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // State for stock data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(
    import.meta.env.VITE_DEFAULT_STOCK || "IBM"
  );
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeframe, setTimeframe] = useState("1D");

  // Fetch popular symbols
  const fetchPopularSymbols = useCallback(async () => {
    try {
      const symbols = await stockApi.getPopularStocks();
      setAvailableSymbols(symbols);
    } catch (error) {
      console.error("Error fetching popular symbols:", error);
      // Fallback to default symbols
      setAvailableSymbols([
        { symbol: "AAPL", company_name: "Apple Inc." },
        { symbol: "MSFT", company_name: "Microsoft Corporation" },
        { symbol: "GOOGL", company_name: "Alphabet Inc." },
        { symbol: "AMZN", company_name: "Amazon.com, Inc." },
        { symbol: "TSLA", company_name: "Tesla, Inc." },
        { symbol: "META", company_name: "Meta Platforms, Inc." },
        { symbol: "NVDA", company_name: "NVIDIA Corporation" },
        { symbol: "NFLX", company_name: "Netflix, Inc." },
        { symbol: "JPM", company_name: "JPMorgan Chase & Co." },
        { symbol: "IBM", company_name: "International Business Machines" },
      ]);
    }
  }, []);

  // Fetch stock quote
  const fetchStockQuote = useCallback(async (symbol) => {
    try {
      return await stockApi.getQuote(symbol);
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = useCallback(
    async (symbol, startDate = null, endDate = null) => {
      try {
        const data = await stockApi.getHistoricalData({
          symbol,
          start_date: startDate,
          end_date: endDate,
          interval:
            timeframe === "1D" ? "1d" : timeframe === "1W" ? "1wk" : "1mo",
        });
        return data;
      } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
      }
    },
    [timeframe]
  );

  // Fetch financial data
  const fetchFinancialData = useCallback(async (symbol) => {
    try {
      return await stockApi.getFinancials(symbol);
    } catch (error) {
      console.error(`Error fetching financials for ${symbol}:`, error);
      throw error;
    }
  }, []);

  // Fetch news for symbol
  const fetchSymbolNews = useCallback(async (symbol) => {
    try {
      return await newsApi.getNewsBySymbol(symbol, 10);
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      throw error;
    }
  }, []);

  // Fetch trending news
  const fetchTrendingNews = useCallback(async () => {
    try {
      return await newsApi.getTrendingNews();
    } catch (error) {
      console.error("Error fetching trending news:", error);
      throw error;
    }
  }, []);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await stockApi.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }, [isAuthenticated]);

  // Add to watchlist
  const addToWatchlist = async (symbol) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to manage watchlist");
      return false;
    }

    try {
      await stockApi.addToWatchlist(symbol);
      setWatchlist((prev) => [...prev, symbol]);
      toast.success(`Added ${symbol} to watchlist`);
      return true;
    } catch (error) {
      console.error(`Error adding ${symbol} to watchlist:`, error);
      toast.error(`Failed to add ${symbol} to watchlist`);
      return false;
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (symbol) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to manage watchlist");
      return false;
    }

    try {
      await stockApi.removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => item !== symbol));
      toast.success(`Removed ${symbol} from watchlist`);
      return true;
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error);
      toast.error(`Failed to remove ${symbol} from watchlist`);
      return false;
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Change selected stock
  const changeStock = (symbol) => {
    if (symbol && symbol !== selectedSymbol) {
      setSelectedSymbol(symbol);
    }
  };

  // Set timeframe
  const setStockTimeframe = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Search stocks
  const searchStocks = async (query) => {
    try {
      return await stockApi.searchStocks(query);
    } catch (error) {
      console.error("Error searching stocks:", error);
      return [];
    }
  };

  // Fetch all data for a stock
  const fetchAllStockData = useCallback(
    async (symbol = selectedSymbol) => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data in parallel
        const [quote, historical, financials, news] = await Promise.all([
          fetchStockQuote(symbol),
          fetchHistoricalData(symbol),
          fetchFinancialData(symbol),
          fetchSymbolNews(symbol),
        ]);

        // Update state with fetched data
        setStockData(quote);
        setHistoricalData(historical);
        setFinancialData(financials);
        setNewsData(news);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError("Failed to fetch stock data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      selectedSymbol,
      fetchStockQuote,
      fetchHistoricalData,
      fetchFinancialData,
      fetchSymbolNews,
    ]
  );

  // Initial data fetch
  useEffect(() => {
    fetchPopularSymbols();
    fetchTrendingNews().then(setTrendingNews).catch(console.error);

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-theme");
    }
  }, [fetchPopularSymbols, fetchTrendingNews]);

  // Fetch data when selected symbol changes
  useEffect(() => {
    if (selectedSymbol) {
      fetchAllStockData(selectedSymbol);
    }
  }, [selectedSymbol, timeframe, fetchAllStockData]);

  // Fetch watchlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated, fetchWatchlist]);

  // Provide context value
  const value = {
    loading,
    error,
    availableSymbols,
    selectedSymbol,
    stockData,
    historicalData,
    financialData,
    companyProfile,
    newsData,
    trendingNews,
    watchlist,
    darkMode,
    lastUpdated,
    timeframe,
    toggleDarkMode,
    changeStock,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    refreshStockData: () => fetchAllStockData(selectedSymbol),
    setTimeframe: setStockTimeframe,
    isInWatchlist: (symbol) => watchlist.includes(symbol),
  };

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  );
};

export default StockContext;
