import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { getNavLinks } from "../routes";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Layout component providing sidebar navigation, top bar, and main content area.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const links = getNavLinks();
  const { isAuthenticated, user, logout } = useAuth();

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="layout" style={isLoginPage ? { gridTemplateColumns: "1fr" } : undefined}>
      {!isLoginPage && (
        <aside className="sidebar" aria-label="Primary">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">⚡</div>
            <div className="brand-text">
              <span className="brand-title">EV Fleet</span>
              <span className="brand-sub">IoT Management</span>
            </div>
          </div>
          <nav className="nav">
            {links.map((l) => {
              const active = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-dot" />
                  {l.title}
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <ThemeToggle />
          </div>
        </aside>
      )}
      <div className="content">
        <header className="topbar">
          <div className="topbar-title">Ocean Professional</div>
          <div className="topbar-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge online" title="Realtime connected">
              Live
            </span>
            {isAuthenticated ? (
              <>
                <span className="badge" title={user?.email}>
                  {user?.name || "User"}
                </span>
                <button
                  className="theme-toggle"
                  onClick={logout}
                  aria-label="Logout"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="badge neutral">Guest</span>
            )}
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
