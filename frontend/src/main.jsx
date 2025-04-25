import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { StockProvider } from "./context/StockContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StockProvider>
          <App />
          <ToastContainer position="top-right" autoClose={5000} />
        </StockProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
