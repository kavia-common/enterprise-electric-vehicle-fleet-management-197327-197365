import React, { useEffect, useMemo, useState } from "react";
import { alertsApi } from "../services";

/**
 * PUBLIC_INTERFACE
 * Alerts page: list alerts with basic filters (severity, status, search).
 */
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return alerts.filter((a) => {
      const matchSearch =
        !s ||
        (a.title || "").toLowerCase().includes(s) ||
        (a.message || "").toLowerCase().includes(s) ||
        (a.vehicleId || "").toLowerCase().includes(s);
      const matchSeverity = severity === "all" || (a.severity || "").toLowerCase() === severity;
      const matchStatus = status === "all" || (a.status || "").toLowerCase() === status;
      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alerts, q, severity, status]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await alertsApi.list({ limit: 200 });
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        if (mounted) setAlerts(items);
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load alerts");
          // Provide some sample data
          setAlerts([
            { id: "a1", vehicleId: "v-1", title: "Low battery", message: "Battery below 20%", severity: "warning", status: "open", createdAt: new Date().toISOString() },
            { id: "a2", vehicleId: "v-2", title: "Charging fault", message: "Station error 0x21", severity: "critical", status: "open", createdAt: new Date().toISOString() },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <section className="page">
      <h1 className="page-title">Alerts</h1>
      <p className="page-subtitle">Incidents and notifications across your fleet.</p>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Filters</div>
        </div>
        <div className="panel-body" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Search by title, message, or vehicle"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Alert search"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", minWidth: 240 }}
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Severity filter"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)" }}
          >
            <option value="all">All severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Status filter"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)" }}
          >
            <option value="all">All status</option>
            <option value="open">Open</option>
            <option value="ack">Acknowledged</option>
            <option value="closed">Closed</option>
          </select>
          {loading && <span className="badge neutral">Loading...</span>}
          {error && <span className="badge" style={{ color: "var(--error)", borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}>{error}</span>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Alerts</div>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "8px 6px" }}>Title</th>
                <th style={{ padding: "8px 6px" }}>Vehicle</th>
                <th style={{ padding: "8px 6px" }}>Severity</th>
                <th style={{ padding: "8px 6px" }}>Status</th>
                <th style={{ padding: "8px 6px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px 6px", fontWeight: 600 }}>
                    {a.title || "-"}
                    <div className="card-desc">{a.message || ""}</div>
                  </td>
                  <td style={{ padding: "10px 6px" }}>{a.vehicleId || "-"}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <span className="badge" style={{
                      color: a.severity === "critical" ? "var(--error)" : (a.severity === "warning" ? "#b45309" : "#6b7280"),
                      borderColor: "var(--border-color)"
                    }}>
                      {a.severity || "info"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 6px" }}>{a.status || "-"}</td>
                  <td style={{ padding: "10px 6px" }}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 12 }}>
                    <span className="badge neutral">No alerts match current filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Alerts;
