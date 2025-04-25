import React from "react";
import { FaHistory, FaPlus, FaEllipsisV, FaTrash } from "react-icons/fa";
import Button from "../common/Button";
import LoadingIndicator from "../common/LoadingIndicator";
import "../../styles/components/chatbot/ChatSidebar.css";

// Session options dropdown component
const SessionOptionsDropdown = ({ session, handleDeleteSession }) => {
  const [showOptions, setShowOptions] = React.useState(false);

  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
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
            onClick={(e) => handleDeleteSession(e, session)}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ChatSidebar = ({
  isAuthenticated,
  sessions,
  loadingSessions,
  sessionId,
  createNewSession,
  fetchChatHistory,
  handleDeleteSession,
}) => {
  if (!isAuthenticated) return null;

  return (
    <div className="chatbot-sidebar">
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <Button
          variant="primary"
          size="small"
          onClick={createNewSession}
          disabled={loadingSessions}
        >
          <FaPlus /> New Chat
        </Button>
      </div>

      <div className="sessions-list">
        {loadingSessions ? (
          <div className="sessions-loading">
            <LoadingIndicator size="small" message="Loading sessions..." />
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
              <SessionOptionsDropdown
                session={session}
                handleDeleteSession={handleDeleteSession}
              />
            </div>
          ))
        ) : (
          <div className="no-sessions">
            <p>No conversations yet</p>
            <Button variant="outline" size="small" onClick={createNewSession}>
              Start a new chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
