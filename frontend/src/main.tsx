import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-900" />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

