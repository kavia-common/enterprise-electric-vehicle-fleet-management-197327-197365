import React, { useEffect, useMemo, useState } from "react";
import { vehiclesApi } from "../services";

/**
 * PUBLIC_INTERFACE
 * Vehicles page: displays list of vehicles with basic filters and a details modal.
 */
const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch =
        !s ||
        (v.name || "").toLowerCase().includes(s) ||
        (v.vin || "").toLowerCase().includes(s) ||
        (v.make || "").toLowerCase().includes(s) ||
        (v.model || "").toLowerCase().includes(s);
      const matchesStatus = status === "all" || (v.status || "").toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, q, status]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await vehiclesApi.list({ limit: 200 });
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        if (mounted) setVehicles(items);
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load vehicles");
          // Provide a small mock so UI is usable offline
          setVehicles([
            { id: "v-1", name: "Cargo 12", vin: "VIN0001", status: "online", make: "Kavia", model: "Cargo", year: 2023, batteryLevel: 82, lastSeen: new Date().toISOString() },
            { id: "v-2", name: "Shuttle 03", vin: "VIN0002", status: "offline", make: "Kavia", model: "Shuttle", year: 2022, batteryLevel: 41, lastSeen: new Date(Date.now() - 86000).toISOString() },
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
      <h1 className="page-title">Vehicles</h1>
      <p className="page-subtitle">Browse and manage vehicles in your fleet.</p>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <div className="panel-title">Filters</div>
        </div>
        <div className="panel-body" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Search by name, VIN, make or model"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Vehicle search"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", minWidth: 240 }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Status filter"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)" }}
          >
            <option value="all">All statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {loading && <span className="badge neutral">Loading...</span>}
          {error && <span className="badge" style={{ color: "var(--error)", borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}>{error}</span>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Vehicles</div>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "8px 6px" }}>Name</th>
                <th style={{ padding: "8px 6px" }}>VIN</th>
                <th style={{ padding: "8px 6px" }}>Status</th>
                <th style={{ padding: "8px 6px" }}>Battery</th>
                <th style={{ padding: "8px 6px" }}>Make/Model</th>
                <th style={{ padding: "8px 6px" }}>Year</th>
                <th style={{ padding: "8px 6px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px 6px", fontWeight: 600 }}>{v.name || "-"}</td>
                  <td style={{ padding: "10px 6px" }}>{v.vin || "-"}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <span className={`badge ${((v.status || "").toLowerCase() === "online" && "online") || ""}`}>
                      {v.status || "unknown"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 6px" }}>{typeof v.batteryLevel === "number" ? `${v.batteryLevel}%` : "-"}</td>
                  <td style={{ padding: "10px 6px" }}>{v.make || "-"} {v.model || ""}</td>
                  <td style={{ padding: "10px 6px" }}>{v.year || "-"}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <button className="theme-toggle" onClick={() => setSelected(v)} style={{ padding: "6px 10px", fontSize: 12 }}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 16 }}>
                    <span className="badge neutral">No vehicles match current filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <VehicleDetailsModal vehicle={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
};

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-color)" }}>
      <div className="card-title" style={{ letterSpacing: 0, textTransform: "none" }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * VehicleDetailsModal - simple modal showing selected vehicle details.
 */
function VehicleDetailsModal({ vehicle, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Vehicle details" style={{
      position: "fixed", inset: 0, background: "rgba(2,6,23,0.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 50
    }}>
      <div className="panel" style={{ width: "100%", maxWidth: 560 }}>
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="panel-title">Vehicle Details</div>
          <button className="theme-toggle" onClick={onClose} style={{ padding: "6px 10px", fontSize: 12 }}>Close</button>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 8 }}>
          <Row label="Name" value={vehicle.name || "-"} />
          <Row label="VIN" value={vehicle.vin || "-"} />
          <Row label="Status" value={vehicle.status || "-"} />
          <Row label="Battery" value={typeof vehicle.batteryLevel === "number" ? `${vehicle.batteryLevel}%` : "-"} />
          <Row label="Make / Model" value={`${vehicle.make || "-"} ${vehicle.model || ""}`} />
          <Row label="Year" value={vehicle.year || "-"} />
          <Row label="Last Seen" value={vehicle.lastSeen ? new Date(vehicle.lastSeen).toLocaleString() : "-"} />
        </div>
      </div>
    </div>
  );
}

export default Vehicles;
