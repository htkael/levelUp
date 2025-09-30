import React from 'react'
import ReactDOM from "react-dom/client"
import './index.css'
import App from './App.jsx'

if (import.meta.env.MODE === "development") {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
