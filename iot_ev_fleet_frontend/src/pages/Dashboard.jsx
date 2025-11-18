import React from "react";
import { useApp } from "../state/store";

/**
 * PUBLIC_INTERFACE
 * Dashboard page with hero cards and quick stats.
 */
const Dashboard = () => {
  const { version } = useApp();
  return (
    <section className="page">
      <h1 className="page-title">Fleet Overview</h1>
      <p className="page-subtitle">Monitor, manage, and optimize your EV fleet.</p>

      <div className="cards">
        <div className="card gradient">
          <div className="card-title">Active Vehicles</div>
          <div className="card-value">128</div>
          <div className="card-desc">Real-time connected devices</div>
        </div>
        <div className="card">
          <div className="card-title">Charging Now</div>
          <div className="card-value">36</div>
          <div className="card-desc">Across 12 depots</div>
        </div>
        <div className="card">
          <div className="card-title">Utilization</div>
          <div className="card-value">84%</div>
          <div className="card-desc">Last 24 hours</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Version</div>
        </div>
        <div className="panel-body">
          <span className="badge neutral">v{version}</span>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
