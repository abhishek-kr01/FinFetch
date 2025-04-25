import React from "react";
import { FaTimes } from "react-icons/fa";
import "../../styles/components/chatbot/SymbolPicker.css";

const SymbolPicker = ({
  showSymbolPicker,
  toggleSymbolPicker,
  selectedSymbols,
  handleSymbolSelect,
  availableSymbols,
}) => {
  if (!showSymbolPicker) return null;

  return (
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
          <div className="no-selected-symbols">No stocks selected</div>
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
  );
};

export default SymbolPicker;
