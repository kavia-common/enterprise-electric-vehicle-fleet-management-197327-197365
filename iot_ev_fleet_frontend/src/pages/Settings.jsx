import React from "react";
import { Config } from "../services/config";

/**
 * PUBLIC_INTERFACE
 * Settings page for environment overview and basic preferences.
 */
const Settings = () => {
  return (
    <section className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Configure your organization and preferences.</p>

      <div className="cards">
        <div className="card gradient">
          <div className="card-title">API Base</div>
          <div className="card-value" style={{ fontSize: 16 }}>{Config.apiBase}</div>
          <div className="card-desc">REACT_APP_API_BASE</div>
        </div>
        <div className="card">
          <div className="card-title">WebSocket URL</div>
          <div className="card-value" style={{ fontSize: 16 }}>{Config.wsUrl}</div>
          <div className="card-desc">REACT_APP_WS_URL</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Theme</div>
        </div>
        <div className="panel-body">
          The Ocean Professional theme is in use. Switch between light and dark using the toggle in the sidebar.
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Organization</div>
        </div>
        <div className="panel-body">
          Organization settings, user roles, and notifications will appear here.
        </div>
      </div>
    </section>
  );
};

export default Settings;
