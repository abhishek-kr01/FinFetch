import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaArrowLeft,
  FaHistory,
  FaPlus,
  FaEllipsisV,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import Button from "../components/common/Button";
import LoadingIndicator from "../components/common/LoadingIndicator";
import chatbotApi from "../api/chatbotApi";
import "../styles/pages/Chatbot.css";

const Chatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const { availableSymbols } = useStock();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hi there! I'm your financial assistant. Ask me anything about stocks, market data, or financial analysis.",
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    // Fetch sessions if authenticated
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  // Fetch user's chat sessions
  const fetchSessions = async () => {
    if (!isAuthenticated) return;

    setLoadingSessions(true);

    try {
      const sessionsData = await chatbotApi.getChatSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch chat history for a session
  const fetchChatHistory = async (sesId) => {
    setLoading(true);

    try {
      const history = await chatbotApi.getChatHistory(sesId);
      setMessages(history);
      setSessionId(sesId);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat session
  const createNewSession = async () => {
    setLoading(true);

    try {
      // Create session with default title
      const newSession = await chatbotApi.createChatSession("New Conversation");

      // Switch to new session
      setSessionId(newSession._id);

      // Reset messages with welcome message
      setMessages([
        {
          id: "welcome",
          content:
            "Hi there! I'm your financial assistant. Ask me anything about stocks, market data, or financial analysis.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Refresh sessions list
      fetchSessions();
    } catch (error) {
      console.error("Error creating new session:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the chatbot
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Create new message object
    const newUserMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Add to messages
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // Clear input field
    setInputValue("");

    // Send to API
    setLoading(true);

    try {
      // Build context with selected symbols if any
      const context =
        selectedSymbols.length > 0 ? { symbols: selectedSymbols } : undefined;

      // Send message to chatbot
      const response = await chatbotApi.sendMessage(
        newUserMessage.content,
        sessionId,
        context
      );

      // If a new session was created, update state
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
        // Refresh sessions
        fetchSessions();
      }

      // Add response to messages
      const botMessage = {
        id: Date.now().toString() + "-response",
        content: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage = {
        id: Date.now().toString() + "-error",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle symbol picker
  const toggleSymbolPicker = () => {
    setShowSymbolPicker(!showSymbolPicker);
  };

  // Handle symbol selection
  const handleSymbolSelect = (symbol) => {
    if (selectedSymbols.includes(symbol)) {
      // Remove symbol
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else {
      // Add symbol (limit to 3)
      if (selectedSymbols.length < 3) {
        setSelectedSymbols([...selectedSymbols, symbol]);
      }
    }
  };

  // Format message timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const messageDate = new Date(date);

    // If same day, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this year, show month and day
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }

    // Otherwise show full date
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Session options dropdown
  const SessionOptionsDropdown = ({ session }) => {
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = (e) => {
      e.stopPropagation();
      setShowOptions(!showOptions);
    };

    const handleDeleteSession = async (e) => {
      e.stopPropagation();

      try {
        await chatbotApi.deleteChatSession(session._id);

        // If current session is deleted, create a new one
        if (session._id === sessionId) {
          createNewSession();
        }

        // Refresh sessions
        fetchSessions();
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    };

    return (
      <div className="session-options">
        <button className="session-options-btn" onClick={toggleOptions}>
          <FaEllipsisV />
        </button>

        {showOptions && (
          <div className="session-options-dropdown">
            <button
              className="session-option-item"
              onClick={handleDeleteSession}
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chatbot-page">
      <div
        className={`chatbot-container ${showSidebar ? "" : "sidebar-hidden"}`}
      >
        {isAuthenticated && (
          <div className="chatbot-sidebar">
            <div className="sidebar-header">
              <h2>Conversations</h2>
              <Button
                variant="primary"
                size="small"
                onClick={createNewSession}
                disabled={loading || loadingSessions}
              >
                <FaPlus /> New Chat
              </Button>
            </div>

            <div className="sessions-list">
              {loadingSessions ? (
                <div className="sessions-loading">
                  <LoadingIndicator
                    size="small"
                    message="Loading sessions..."
                  />
                </div>
              ) : sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`session-item ${
                      session._id === sessionId ? "active" : ""
                    }`}
                    onClick={() => fetchChatHistory(session._id)}
                  >
                    <div className="session-icon">
                      <FaHistory />
                    </div>
                    <div className="session-info">
                      <div className="session-title">{session.title}</div>
                      <div className="session-date">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <SessionOptionsDropdown session={session} />
                  </div>
                ))
              ) : (
                <div className="no-sessions">
                  <p>No conversations yet</p>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={createNewSession}
                  >
                    Start a new chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="chatbot-main">
          <div className="chatbot-header">
            <button
              className="toggle-sidebar-button"
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              {showSidebar ? <FaArrowLeft /> : <FaHistory />}
            </button>

            <h1>AI Financial Assistant</h1>

            <Link to="/dashboard" className="back-to-dashboard">
              Back to Dashboard
            </Link>
          </div>

          <div className="chat-content">
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.isUser ? "user-message" : "bot-message"
                  } ${message.isError ? "error-message" : ""}`}
                >
                  <div className="message-avatar">
                    {message.isUser ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message bot-message">
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                  <div className="message-content">
                    <div className="message-text typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {showSymbolPicker && (
              <div className="symbol-picker">
                <div className="symbol-picker-header">
                  <h3>Add stock context</h3>
                  <button
                    className="close-picker-btn"
                    onClick={toggleSymbolPicker}
                    aria-label="Close symbol picker"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="symbol-picker-help">
                  Select up to 3 stocks to provide context for your questions
                </p>
                <div className="selected-symbols">
                  {selectedSymbols.length > 0 ? (
                    selectedSymbols.map((symbol) => (
                      <div key={symbol} className="selected-symbol">
                        {symbol}
                        <button
                          onClick={() => handleSymbolSelect(symbol)}
                          aria-label={`Remove ${symbol}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-selected-symbols">
                      No stocks selected
                    </div>
                  )}
                </div>
                <div className="symbol-list">
                  {availableSymbols.map((stock) => (
                    <button
                      key={stock.symbol}
                      className={`symbol-item ${
                        selectedSymbols.includes(stock.symbol) ? "selected" : ""
                      }`}
                      onClick={() => handleSymbolSelect(stock.symbol)}
                      disabled={
                        selectedSymbols.length >= 3 &&
                        !selectedSymbols.includes(stock.symbol)
                      }
                    >
                      <span className="symbol-code">{stock.symbol}</span>
                      <span className="symbol-name">{stock.company_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-container">
              <button
                className="context-button"
                onClick={toggleSymbolPicker}
                aria-label="Add stock context"
              >
                <FaPlus />
              </button>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about stocks, market trends, financial metrics..."
                disabled={loading}
              />

              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!inputValue.trim() || loading}
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>

            {selectedSymbols.length > 0 && (
              <div className="context-info">
                <span>Context: </span>
                {selectedSymbols.map((symbol, index) => (
                  <span key={symbol} className="context-symbol">
                    {symbol}
                    {index < selectedSymbols.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
