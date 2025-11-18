import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { getNavLinks } from "../routes";

/**
 * PUBLIC_INTERFACE
 * Layout component providing sidebar navigation, top bar, and main content area.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const links = getNavLinks();

  return (
    <div className="layout">
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
      <div className="content">
        <header className="topbar">
          <div className="topbar-title">Ocean Professional</div>
          <div className="topbar-actions">
            <span className="badge online" title="Realtime connected">
              Live
            </span>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
