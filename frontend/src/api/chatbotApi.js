import apiClient from "./apiClient";

const chatbotApi = {
  // Send a message to the chatbot
  sendMessage: async (message, sessionId = null, context = null) => {
    try {
      const response = await apiClient.post("/chatbot/chat", {
        message,
        session_id: sessionId,
        context,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      throw error;
    }
  },

  // Get chat history for a session
  getChatHistory: async (sessionId) => {
    try {
      const response = await apiClient.get(`/chatbot/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error getting chat history for session ${sessionId}:`,
        error
      );
      throw error;
    }
  },

  // Get user's chat sessions
  getChatSessions: async () => {
    try {
      const response = await apiClient.get("/chatbot/sessions");
      return response.data;
    } catch (error) {
      console.error("Error getting chat sessions:", error);
      throw error;
    }
  },

  // Create a new chat session
  createChatSession: async (title, context = {}) => {
    try {
      const response = await apiClient.post("/chatbot/sessions", {
        title,
        context,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }
  },

  // Update a chat session
  updateChatSession: async (sessionId, title, context) => {
    try {
      const response = await apiClient.put(`/chatbot/sessions/${sessionId}`, {
        title,
        context,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating chat session ${sessionId}:`, error);
      throw error;
    }
  },

  // Delete a chat session
  deleteChatSession: async (sessionId) => {
    try {
      const response = await apiClient.delete(`/chatbot/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting chat session ${sessionId}:`, error);
      throw error;
    }
  },
};

export default chatbotApi;
