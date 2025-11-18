import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Login page with basic email/password inputs.
 * Calls AuthContext.login and redirects via provider upon success.
 */
const Login = () => {
  const { login, loading, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // navigation handled in AuthContext.login; from path can be used if needed
    } catch {
      // error is surfaced from context
    }
  };

  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <div className="content">
        <header className="topbar">
          <div className="topbar-title">EV Fleet - Sign In</div>
          <div className="topbar-actions">
            <span className="badge neutral">Access Required</span>
          </div>
        </header>

        <main className="main" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
          <form
            onSubmit={onSubmit}
            className="panel"
            style={{ width: "100%", maxWidth: 420 }}
            aria-label="Login form"
          >
            <div className="panel-header">
              <div className="panel-title">Welcome back</div>
            </div>
            <div className="panel-body">
              {from !== "/" && (
                <div className="badge neutral" style={{ marginBottom: 12 }}>
                  Redirect after login: {from}
                </div>
              )}
              {error && (
                <div
                  className="badge"
                  style={{
                    color: "var(--error)",
                    borderColor: "rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.08)",
                    marginBottom: 12,
                  }}
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span className="card-title" style={{ letterSpacing: 0, textTransform: "none" }}>
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border-color)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span className="card-title" style={{ letterSpacing: 0, textTransform: "none" }}>
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border-color)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="theme-toggle"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Login;
