import apiClient from "./apiClient";

const stockApi = {
  // Get stock quote
  getQuote: async (symbol) => {
    try {
      const response = await apiClient.get(`/stocks/quotes/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      throw error;
    }
  },

  // Get batch quotes for multiple symbols
  getBatchQuotes: async (symbols) => {
    try {
      const response = await apiClient.post("/stocks/quotes/batch", symbols);
      return response.data;
    } catch (error) {
      console.error("Error getting batch quotes:", error);
      throw error;
    }
  },

  // Get historical data
  getHistoricalData: async ({ symbol, start_date, end_date, interval }) => {
    try {
      const response = await apiClient.post("/stocks/historical", {
        symbol,
        start_date,
        end_date,
        interval,
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting historical data for ${symbol}:`, error);
      throw error;
    }
  },

  // Get financial data
  getFinancials: async (symbol) => {
    try {
      const response = await apiClient.get(`/stocks/financials/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting financials for ${symbol}:`, error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await apiClient.post("/stocks/search", { query });
      return response.data;
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw error;
    }
  },

  // Get popular/trending stocks
  getPopularStocks: async () => {
    try {
      const response = await apiClient.get("/stocks/popular");
      return response.data;
    } catch (error) {
      console.error("Error getting popular stocks:", error);
      throw error;
    }
  },

  // Get user watchlist
  getWatchlist: async () => {
    try {
      const response = await apiClient.get("/stocks/watchlist");
      return response.data;
    } catch (error) {
      console.error("Error getting watchlist:", error);
      throw error;
    }
  },

  // Update watchlist
  updateWatchlist: async (symbols) => {
    try {
      const response = await apiClient.put("/stocks/watchlist", { symbols });
      return response.data;
    } catch (error) {
      console.error("Error updating watchlist:", error);
      throw error;
    }
  },

  // Add symbol to watchlist
  addToWatchlist: async (symbol) => {
    try {
      const response = await apiClient.post(`/stocks/watchlist/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding ${symbol} to watchlist:`, error);
      throw error;
    }
  },

  // Remove symbol from watchlist
  removeFromWatchlist: async (symbol) => {
    try {
      const response = await apiClient.delete(`/stocks/watchlist/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error);
      throw error;
    }
  },
};

export default stockApi;
