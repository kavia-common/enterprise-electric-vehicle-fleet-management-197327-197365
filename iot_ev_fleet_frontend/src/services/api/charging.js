 /**
  * PUBLIC_INTERFACE
  * Charging API client.
  * Manages charging sessions, stations, and power controls.
  */
import { api } from "../apiClient";
import { Config } from "../config";

let MOCK_STATIONS = [
  { id: "st-1", name: "Depot A #1", status: "online", location: "Depot A", powerLimitKw: 50 },
  { id: "st-2", name: "Depot A #2", status: "online", location: "Depot A", powerLimitKw: 60 },
  { id: "st-3", name: "Depot B #1", status: "offline", location: "Depot B", powerLimitKw: 40 },
];

let MOCK_SESSIONS = [
  // Initially empty; sessions list shows an inline empty state
];

// PUBLIC_INTERFACE
export const chargingApi = {
  // Sessions
  listSessions: async (query = {}, meta) => {
    if (Config.MOCK_MODE) {
      // Optionally filter by status
      const status = (query.status || "all").toLowerCase();
      const items = MOCK_SESSIONS.filter(s => status === "all" || (s.status || "").toLowerCase() === status);
      return { items, total: items.length };
    }
    const qs = new URLSearchParams(query).toString();
    return api.get(`/charging/sessions${qs ? `?${qs}` : ""}`, meta);
  },
  getSession: async (id, meta) => {
    if (Config.MOCK_MODE) {
      return MOCK_SESSIONS.find(s => s.id === String(id)) || null;
    }
    return api.get(`/charging/sessions/${encodeURIComponent(id)}`, meta);
  },
  startSession: (vehicleId, stationId, meta) => {
    if (Config.MOCK_MODE) {
      const id = `sess-${Date.now()}`;
      const s = {
        id, vehicleId, stationId, stationName: MOCK_STATIONS.find(st => st.id === stationId)?.name || stationId,
        powerKw: 32, energyKwh: 1, status: "active", startedAt: new Date().toISOString()
      };
      MOCK_SESSIONS.unshift(s);
      return Promise.resolve(s);
    }
    return api.post(`/charging/sessions`, { vehicleId, stationId }, meta);
  },
  stopSession: (id, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_SESSIONS.findIndex(s => s.id === String(id));
      if (idx >= 0) MOCK_SESSIONS.splice(idx, 1);
      return Promise.resolve({ ok: true });
    }
    return api.post(`/charging/sessions/${encodeURIComponent(id)}/stop`, {}, meta);
  },

  // Stations
  listStations: async (query = {}, meta) => {
    if (Config.MOCK_MODE) {
      return { items: MOCK_STATIONS.slice(), total: MOCK_STATIONS.length };
    }
    const qs = new URLSearchParams(query).toString();
    return api.get(`/charging/stations${qs ? `?${qs}` : ""}`, meta);
  },
  getStation: async (id, meta) => {
    if (Config.MOCK_MODE) {
      return MOCK_STATIONS.find(s => s.id === String(id)) || null;
    }
    return api.get(`/charging/stations/${encodeURIComponent(id)}`, meta);
  },
  updateStation: (id, payload, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_STATIONS.findIndex(s => s.id === String(id));
      if (idx >= 0) {
        MOCK_STATIONS[idx] = { ...MOCK_STATIONS[idx], ...payload };
        return Promise.resolve(MOCK_STATIONS[idx]);
      }
      return Promise.resolve(null);
    }
    return api.put(`/charging/stations/${encodeURIComponent(id)}`, payload, meta);
  },

  // Power / Load controls
  setPowerLimit: (stationId, kwLimit, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_STATIONS.findIndex(s => s.id === String(stationId));
      if (idx >= 0) {
        MOCK_STATIONS[idx] = { ...MOCK_STATIONS[idx], powerLimitKw: Number(kwLimit) };
      }
      return Promise.resolve({ ok: true, stationId, kwLimit: Number(kwLimit) });
    }
    return api.post(`/charging/stations/${encodeURIComponent(stationId)}/power-limit`, { kwLimit }, meta);
  },
};
