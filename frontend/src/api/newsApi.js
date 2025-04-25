import apiClient from "./apiClient";

const newsApi = {
  // Get latest news
  getLatestNews: async (limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get(
        `/news/latest?limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting latest news:", error);
      throw error;
    }
  },

  // Get news for a specific symbol
  getNewsBySymbol: async (symbol, limit = 10) => {
    try {
      const response = await apiClient.post("/news/filter", {
        symbol,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting news for ${symbol}:`, error);
      throw error;
    }
  },

  // Get news for multiple symbols
  getNewsBySymbols: async (symbols, limit = 5) => {
    try {
      const response = await apiClient.post("/news/by-symbols", {
        symbols,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting news for multiple symbols:", error);
      throw error;
    }
  },

  // Search news
  searchNews: async (query, limit = 20) => {
    try {
      const response = await apiClient.post("/news/search", {
        query,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error searching news:", error);
      throw error;
    }
  },

  // Get trending news
  getTrendingNews: async () => {
    try {
      const response = await apiClient.get("/news/trending");
      return response.data;
    } catch (error) {
      console.error("Error getting trending news:", error);
      throw error;
    }
  },

  // Get a specific news article
  getNewsArticle: async (newsId) => {
    try {
      const response = await apiClient.get(`/news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting news article ${newsId}:`, error);
      throw error;
    }
  },
};

export default newsApi;
