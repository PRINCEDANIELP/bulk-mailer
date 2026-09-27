import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username.trim(), password);
      login(data.token, data.username);
      navigate("/send");
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="envelope-screen">
      <div className="envelope-card">
        <div
          className="mail-icon-badge"
          style={{
            width: 48,
            height: 48,
            borderRadius: 6,
            background: "rgba(193, 85, 59, 0.12)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--rust)",
            marginBottom: 16,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-8.61 10.79c.18.14.4.21.61.21s.43-.07.61-.21l1.55-1.21L18.58 18H5.41l4.42-4.42 1.55 1.21ZM20 6v.51l-8 6.22-8-6.22V6zm0 3.04v7.54l-4.24-4.24zm-11.76 3.3L4 16.58V9.04zM20 18"></path>
          </svg>
        </div>
        <h1>Bulk Mailer</h1>
        <p className="subtext">Sign in to send and track bulk mail.</p>

        <div
          style={{
            background: "#f0f4f0",
            border: "1px solid #d0ded0",
            borderRadius: 4,
            padding: "8px 12px",
            fontSize: 12,
            color: "#2e5636",
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          <div>
            <strong>Username:</strong> <code>admin</code>
          </div>
          <div>
            <strong>Password:</strong> <code>admin123</code>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              required
            />
          </div>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
