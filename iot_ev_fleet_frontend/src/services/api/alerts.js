 /**
  * PUBLIC_INTERFACE
  * Alerts API client for creating, listing, acknowledging, and deleting alerts.
  */
import { api } from "../apiClient";
import { Config } from "../config";

const MOCK_ALERTS = [
  { id: "a1", vehicleId: "v-1", title: "Low battery", message: "Battery below 20%", severity: "warning", status: "open", createdAt: new Date().toISOString() },
  { id: "a2", vehicleId: "v-2", title: "Charging fault", message: "Station error 0x21", severity: "critical", status: "open", createdAt: new Date().toISOString() },
  { id: "a3", vehicleId: "v-2", title: "Tire pressure", message: "Rear right tire low", severity: "info", status: "ack", createdAt: new Date(Date.now() - 500000).toISOString() },
];

// PUBLIC_INTERFACE
export const alertsApi = {
  list: async (query = {}, meta) => {
    if (Config.MOCK_MODE) {
      const { severity = "all", status = "all" } = query || {};
      const items = MOCK_ALERTS.filter(a => {
        const sevOk = String(severity).toLowerCase() === "all" || (a.severity || "").toLowerCase() === String(severity).toLowerCase();
        const stOk = String(status).toLowerCase() === "all" || (a.status || "").toLowerCase() === String(status).toLowerCase();
        return sevOk && stOk;
      });
      return { items, total: items.length };
    }
    const qs = new URLSearchParams(query).toString();
    return api.get(`/alerts${qs ? `?${qs}` : ""}`, meta);
  },
  get: async (id, meta) => {
    if (Config.MOCK_MODE) {
      return MOCK_ALERTS.find(a => a.id === String(id)) || null;
    }
    return api.get(`/alerts/${encodeURIComponent(id)}`, meta);
  },
  create: (payload, meta) => {
    if (Config.MOCK_MODE) {
      const a = { id: `a${MOCK_ALERTS.length + 1}`, ...payload, createdAt: new Date().toISOString() };
      MOCK_ALERTS.unshift(a);
      return Promise.resolve(a);
    }
    return api.post(`/alerts`, payload, meta);
  },
  acknowledge: (id, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_ALERTS.findIndex(a => a.id === String(id));
      if (idx >= 0) MOCK_ALERTS[idx] = { ...MOCK_ALERTS[idx], status: "ack" };
      return Promise.resolve({ ok: true });
    }
    return api.post(`/alerts/${encodeURIComponent(id)}/ack`, {}, meta);
  },
  remove: (id, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_ALERTS.findIndex(a => a.id === String(id));
      if (idx >= 0) MOCK_ALERTS.splice(idx, 1);
      return Promise.resolve({ ok: true });
    }
    return api.delete(`/alerts/${encodeURIComponent(id)}`, meta);
  },
};
