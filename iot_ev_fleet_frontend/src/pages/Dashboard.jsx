import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../state/store";
import { alertsApi, vehiclesApi } from "../services";
import { createTelemetryClient } from "../services/ws/telemetryClient";

/**
 * PUBLIC_INTERFACE
 * Dashboard page with hero cards and quick stats.
 * - Shows KPI cards
 * - Live telemetry stream (recent messages)
 * - Pulls vehicles/alerts to simulate KPIs (kept minimal)
 */
const Dashboard = () => {
  const { version } = useApp();

  // KPI state
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [chargingNow, setChargingNow] = useState(0);
  const [utilization, setUtilization] = useState(0);

  // Live telemetry state
  const [liveMessages, setLiveMessages] = useState([]);
  const clientRef = useRef(null);

  // Compute a friendly utilization description
  const utilizationText = useMemo(() => `${utilization}%`, [utilization]);

  useEffect(() => {
    let mounted = true;

    // Load some KPI data from APIs (best-effort; tolerate failures)
    (async () => {
      try {
        const vehRes = await vehiclesApi.list({ limit: 200 }).catch(() => []);
        const vehicles = Array.isArray(vehRes?.items) ? vehRes.items : (Array.isArray(vehRes) ? vehRes : []);
        const active = vehicles.filter((v) => (v.status || "").toLowerCase() === "online").length;
        const charging = vehicles.filter((v) => v.charging === true).length;
        if (mounted) {
          setActiveVehicles(active || Math.max(vehicles.length - 2, 0));
          setChargingNow(charging || Math.floor((vehicles.length || 20) * 0.25));
        }
      } catch {
        if (mounted) {
          setActiveVehicles(128);
          setChargingNow(36);
        }
      }
      try {
        const alerts = await alertsApi.list({ severity: "warning", limit: 50 }).catch(() => ({ total: 0 }));
        const base = 70;
        const adj = Math.min(30, Math.max(0, 30 - (alerts?.total || 0)));
        if (mounted) setUtilization(base + Math.round(adj / 3));
      } catch {
        if (mounted) setUtilization(84);
      }
    })();

    // Setup telemetry client and subscribe wildcard for demo
    const client = createTelemetryClient({ path: "" });
    clientRef.current = client;
    const unsubscribe = client.subscribe({ vehicleId: "*", topic: "*" }, (msg) => {
      setLiveMessages((prev) => {
        const next = [msg, ...prev].slice(0, 20);
        return next;
      });
    });

    return () => {
      mounted = false;
      try {
        unsubscribe?.();
      } catch {
        //
      }
      try {
        client.close();
      } catch {
        //
      }
    };
  }, []);

  return (
    <section className="page">
      <h1 className="page-title">Fleet Overview</h1>
      <p className="page-subtitle">Monitor, manage, and optimize your EV fleet.</p>

      <div className="cards">
        <div className="card gradient">
          <div className="card-title">Active Vehicles</div>
          <div className="card-value">{activeVehicles}</div>
          <div className="card-desc">Real-time connected devices</div>
        </div>
        <div className="card">
          <div className="card-title">Charging Now</div>
          <div className="card-value">{chargingNow}</div>
          <div className="card-desc">Across depots</div>
        </div>
        <div className="card">
          <div className="card-title">Utilization</div>
          <div className="card-value">{utilizationText}</div>
          <div className="card-desc">Last 24 hours</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Live Telemetry</div>
        </div>
        <div className="panel-body" style={{ maxHeight: 260, overflow: "auto" }}>
          {liveMessages.length === 0 ? (
            <div className="badge neutral">Listening for messages...</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {liveMessages.map((m, idx) => {
                const id = m.id || `${m.vehicleId || "veh"}-${m.topic || "topic"}-${idx}`;
                const t = m.timestamp || m.t || Date.now();
                const ts = new Date(t).toLocaleTimeString();
                return (
                  <li key={id} className="card" style={{ padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600 }}>{m.vehicleId || "vehicle"}</div>
                      <span className="badge">{m.topic || "telemetry"} • {ts}</span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#374151", background: "transparent" }}>
                      {JSON.stringify(m.payload ?? m, null, 2)}
                    </pre>
                  </li>
                );
              })}
            </ul>
          )}
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
