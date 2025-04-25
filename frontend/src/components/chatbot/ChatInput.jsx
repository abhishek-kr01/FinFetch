import React from "react";
import { FaPlus, FaPaperPlane } from "react-icons/fa";
import "../../styles/components/chatbot/ChatInput.css";

const ChatInput = ({
  inputValue,
  setInputValue,
  handleKeyPress,
  sendMessage,
  loading,
  toggleSymbolPicker,
}) => {
  return (
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
  );
};

export default ChatInput;
