import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "";

  const handleLogin = async () => {
    const { username, password } = credentials;
    try {
  // default to relative serverless function path when REACT_APP_API_URL is not set
  const base = API_BASE || "";
  const url = `${base}/api/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token); // Store JWT token
          onLogin();
        } else {
          setError(data.error || "Invalid username or password.");
        }
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Failed to connect to the server.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>Login</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, username: e.target.value }))
          }
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, password: e.target.value }))
          }
          style={{ padding: "10px", marginRight: "10px" }}
        />
      </div>
      <button
        type="button"
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          position: "relative",
          zIndex: 10001,
        }}
      >
        Login
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
