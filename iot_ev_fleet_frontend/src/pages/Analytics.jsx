import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Analytics page with simple tabs and SVG chart placeholders.
 */
const Analytics = () => {
  const tabs = [
    { id: "utilization", label: "Utilization" },
    { id: "energy", label: "Energy" },
    { id: "costs", label: "Costs" },
  ];
  const [active, setActive] = useState("utilization");

  return (
    <section className="page">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Performance insights and optimization trends.</p>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Overview</div>
        </div>
        <div className="panel-body">
          <div className="cards">
            <div className="card gradient">
              <div className="card-title">Avg Utilization</div>
              <div className="card-value">78%</div>
              <div className="card-desc">Last 30 days</div>
            </div>
            <div className="card">
              <div className="card-title">Energy Used</div>
              <div className="card-value">41,200 kWh</div>
              <div className="card-desc">Last 30 days</div>
            </div>
            <div className="card">
              <div className="card-title">Charging Cost</div>
              <div className="card-value">$12,430</div>
              <div className="card-desc">Last 30 days</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                className="theme-toggle"
                onClick={() => setActive(t.id)}
                aria-pressed={active === t.id}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  opacity: active === t.id ? 1 : 0.8,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <svg viewBox="0 0 600 220" width="100%" height="220" role="img" aria-label="Chart placeholder">
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(37,99,235,0.5)" />
                  <stop offset="100%" stopColor="rgba(37,99,235,0.05)" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="600" height="220" fill="transparent" />
              {/* Grid lines */}
              {[20, 60, 100, 140, 180].map((y) => (
                <line key={y} x1="40" y1={y} x2="580" y2={y} stroke="#e5e7eb" strokeWidth="1" />
              ))}
              {/* Axes */}
              <line x1="40" y1="200" x2="580" y2="200" stroke="#9ca3af" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="200" stroke="#9ca3af" strokeWidth="1.5" />
              {/* Area path (mock data varies by tab) */}
              {active === "utilization" && (
                <>
                  <path d="M40 160 L100 120 L160 140 L220 100 L280 110 L340 90 L400 80 L460 100 L520 70 L580 90 L580 200 L40 200 Z" fill="url(#grad)" />
                  <polyline points="40,160 100,120 160,140 220,100 280,110 340,90 400,80 460,100 520,70 580,90" stroke="#2563EB" strokeWidth="2.5" fill="none" />
                </>
              )}
              {active === "energy" && (
                <>
                  <path d="M40 180 L100 150 L160 160 L220 140 L280 150 L340 120 L400 130 L460 110 L520 140 L580 100 L580 200 L40 200 Z" fill="url(#grad)" />
                  <polyline points="40,180 100,150 160,160 220,140 280,150 340,120 400,130 460,110 520,140 580,100" stroke="#2563EB" strokeWidth="2.5" fill="none" />
                </>
              )}
              {active === "costs" && (
                <>
                  <path d="M40 170 L100 165 L160 150 L220 140 L280 135 L340 120 L400 115 L460 110 L520 105 L580 100 L580 200 L40 200 Z" fill="url(#grad)" />
                  <polyline points="40,170 100,165 160,150 220,140 280,135 340,120 400,115 460,110 520,105 580,100" stroke="#2563EB" strokeWidth="2.5" fill="none" />
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
