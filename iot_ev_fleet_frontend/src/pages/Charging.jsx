import React, { useEffect, useMemo, useState } from "react";
import { chargingApi } from "../services";
import { Config } from "../services/config";

/**
 * PUBLIC_INTERFACE
 * Charging page with:
 * - Live/current sessions list (polling)
 * - Stations list with basic power limit control
 * - Basic schedules UI placeholder
 */
const Charging = () => {
  const [sessions, setSessions] = useState([]);
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // stationId currently updating

  // Simple polling for sessions every 10s
  useEffect(() => {
    let mounted = true;
    let timer = null;

    const load = async () => {
      try {
        const res = await chargingApi.listSessions({ status: "active", limit: 100 });
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        if (mounted) setSessions(items);
      } catch (e) {
        if (mounted) {
          setSessions([]);
          // In mock mode, don't show error toasts for unavailable endpoints
          if (!(Config.MOCK_MODE && (e?.status === 404 || /mock mode/i.test(e?.message || "")))) {
            setError(e?.message || "Failed to load sessions");
          }
        }
      }
    };

    const loadStations = async () => {
      try {
        const res = await chargingApi.listStations({ limit: 100 });
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        if (mounted) setStations(items);
      } catch (e) {
        if (mounted) {
          // In mock mode, silently fallback to empty (mock API already returns data)
          if (!(Config.MOCK_MODE && (e?.status === 404 || /mock mode/i.test(e?.message || "")))) {
            setError(e?.message || "Failed to load stations");
          }
          setStations([]);
        }
      }
    };

    load();
    loadStations();
    timer = setInterval(load, 10000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const activeCount = useMemo(() => sessions.length, [sessions]);

  const onSetLimit = async (stationId, kw) => {
    setBusy(stationId);
    try {
      await chargingApi.setPowerLimit(stationId, Number(kw));
      // Update local
      setStations((prev) =>
        prev.map((s) => (s.id === stationId ? { ...s, powerLimitKw: Number(kw) } : s))
      );
    } catch (e) {
      if (!(Config.MOCK_MODE && (e?.status === 404 || /mock mode/i.test(e?.message || "")))) {
        setError(e?.message || "Failed to update power limit");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">Charging</h1>
      <p className="page-subtitle">Real-time charging sessions and load control.</p>

      {error && (
        <div className="badge" style={{ color: "var(--error)", borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", marginBottom: 12 }}>{error}</div>
      )}

      <div className="cards">
        <div className="card gradient">
          <div className="card-title">Active Sessions</div>
          <div className="card-value">{activeCount}</div>
          <div className="card-desc">Charging now across stations</div>
        </div>
        <div className="card">
          <div className="card-title">Stations</div>
          <div className="card-value">{stations.length}</div>
          <div className="card-desc">Total configured</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Live Sessions</div>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "8px 6px" }}>Vehicle</th>
                <th style={{ padding: "8px 6px" }}>Station</th>
                <th style={{ padding: "8px 6px" }}>kW</th>
                <th style={{ padding: "8px 6px" }}>kWh</th>
                <th style={{ padding: "8px 6px" }}>Started</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px 6px", fontWeight: 600 }}>{s.vehicleName || s.vehicleId}</td>
                  <td style={{ padding: "10px 6px" }}>{s.stationName || s.stationId}</td>
                  <td style={{ padding: "10px 6px" }}>{s.powerKw ?? "-"}</td>
                  <td style={{ padding: "10px 6px" }}>{s.energyKwh ?? "-"}</td>
                  <td style={{ padding: "10px 6px" }}>{s.startedAt ? new Date(s.startedAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 12 }}>
                    <span className="badge neutral">No active sessions</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Stations</div>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 10 }}>
          {stations.map((st) => (
            <div className="card" key={st.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "grid" }}>
                <div style={{ fontWeight: 700 }}>{st.name || st.id}</div>
                <div className="card-desc">{st.location || "Unknown location"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`badge ${((st.status || "").toLowerCase() === "online" && "online") || ""}`}>{st.status || "unknown"}</span>
                <label className="card-title" style={{ letterSpacing: 0, textTransform: "none" }}>
                  Limit (kW)
                </label>
                <input
                  type="number"
                  defaultValue={st.powerLimitKw ?? 50}
                  min={5}
                  max={350}
                  step={5}
                  aria-label={`Power limit for ${st.name || st.id}`}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-color)", width: 90 }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (!val || Number(val) === st.powerLimitKw) return;
                    onSetLimit(st.id, val);
                  }}
                />
                <button
                  className="theme-toggle"
                  onClick={() => onSetLimit(st.id, st.powerLimitKw ?? 50)}
                  disabled={busy === st.id}
                  style={{ padding: "6px 10px", fontSize: 12 }}
                >
                  {busy === st.id ? "Saving..." : "Apply"}
                </button>
              </div>
            </div>
          ))}
          {stations.length === 0 && <span className="badge neutral">No stations.</span>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Schedules</div>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 10 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Nighttime Off-peak</div>
            <div className="card-desc">00:00 - 06:00 • Max 60% SoC • All depots</div>
            <button className="theme-toggle" style={{ marginTop: 8, padding: "6px 10px", fontSize: 12 }}>Edit</button>
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Midday Solar</div>
            <div className="card-desc">11:30 - 14:00 • Max 100 kW per station • Depot B</div>
            <button className="theme-toggle" style={{ marginTop: 8, padding: "6px 10px", fontSize: 12 }}>Edit</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Charging;
