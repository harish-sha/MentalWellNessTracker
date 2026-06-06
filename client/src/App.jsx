import { useState, useEffect } from "react";

function App() {
  const [backendStatus, setBackendStatus] = useState(
    "Connecting to backend...",
  );
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch((err) =>
        setBackendStatus("Failed to connect to backend. Is it running?"),
      );
  }, [API_URL]);

  return (
    <div
      style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>🧠 Mental Wellness Tracker</h1>
      <p>Status Check:</p>
      <div
        style={{
          background: "#f0f0f0",
          padding: "20px",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        <strong>{backendStatus}</strong>
      </div>
    </div>
  );
}

export default App;
