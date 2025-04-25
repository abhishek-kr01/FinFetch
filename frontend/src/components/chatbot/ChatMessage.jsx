import React from "react";
import { FaUser, FaRobot } from "react-icons/fa";
import "../../styles/components/chatbot/ChatMessage.css";

const ChatMessage = ({ message, formatTimestamp }) => {
  return (
    <div
      className={`message ${message.isUser ? "user-message" : "bot-message"} ${
        message.isError ? "error-message" : ""
      }`}
    >
      <div className="message-avatar">
        {message.isUser ? <FaUser /> : <FaRobot />}
      </div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTimestamp(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
