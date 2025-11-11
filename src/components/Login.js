import React, { useState } from "react";

// Accessible & semantic login form component.
// Adds id/name, labels, autocomplete hints, and allows pressing Enter.
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || "";

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); // support form submit
    const { username, password } = credentials;
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const base = API_BASE || ""; // relative path fallback
      const url = `${base}/api/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        maxWidth: "420px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>Login</h1>
      <form onSubmit={handleLogin} aria-label="Login form" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label htmlFor="login-username" style={{ textAlign: "left", fontWeight: 600 }}>
            Username
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, username: e.target.value }))
            }
            style={{ padding: "10px" }}
            aria-required="true"
          />
          <label htmlFor="login-password" style={{ textAlign: "left", fontWeight: 600 }}>
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
            style={{ padding: "10px" }}
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "18px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: submitting ? "#6c757d" : "#007BFF",
            color: "#FFF",
            border: "none",
            borderRadius: "5px",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
          aria-busy={submitting ? "true" : "false"}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && (
        <p role="alert" style={{ color: "red", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Login;
