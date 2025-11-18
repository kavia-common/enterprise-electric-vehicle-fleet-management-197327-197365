 /**
  * PUBLIC_INTERFACE
  * Charging API client.
  * Manages charging sessions, stations, and power controls.
  */
import { api } from "../apiClient";

// PUBLIC_INTERFACE
export const chargingApi = {
  // Sessions
  listSessions: (query = {}, meta) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/charging/sessions${qs ? `?${qs}` : ""}`, meta);
  },
  getSession: (id, meta) => api.get(`/charging/sessions/${encodeURIComponent(id)}`, meta),
  startSession: (vehicleId, stationId, meta) =>
    api.post(`/charging/sessions`, { vehicleId, stationId }, meta),
  stopSession: (id, meta) =>
    api.post(`/charging/sessions/${encodeURIComponent(id)}/stop`, {}, meta),

  // Stations
  listStations: (query = {}, meta) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/charging/stations${qs ? `?${qs}` : ""}`, meta);
  },
  getStation: (id, meta) => api.get(`/charging/stations/${encodeURIComponent(id)}`, meta),
  updateStation: (id, payload, meta) =>
    api.put(`/charging/stations/${encodeURIComponent(id)}`, payload, meta),

  // Power / Load controls
  setPowerLimit: (stationId, kwLimit, meta) =>
    api.post(`/charging/stations/${encodeURIComponent(stationId)}/power-limit`, { kwLimit }, meta),
};
