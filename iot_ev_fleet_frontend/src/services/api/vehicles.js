 /**
  * PUBLIC_INTERFACE
  * Vehicles API client.
  * Provides typed helpers for listing, retrieving, creating, updating, and deleting vehicles,
  * plus domain actions like assign/unassign.
  */
import { api } from "../apiClient";
import { Config } from "../config";

/**
 * Vehicle type description (for JSDoc)
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} vin
 * @property {string} name
 * @property {string} status - online|offline|maintenance
 * @property {string} make
 * @property {string} model
 * @property {number} year
 * @property {number} batteryLevel
 * @property {string} lastSeen
 */

// Small in-memory mock dataset for MOCK_MODE
const MOCK_VEHICLES = [
  { id: "v-1", name: "Cargo 12", vin: "VIN0001", status: "online", make: "Kavia", model: "Cargo", year: 2023, batteryLevel: 82, lastSeen: new Date().toISOString(), charging: true },
  { id: "v-2", name: "Shuttle 03", vin: "VIN0002", status: "offline", make: "Kavia", model: "Shuttle", year: 2022, batteryLevel: 41, lastSeen: new Date(Date.now() - 86000).toISOString(), charging: false },
  { id: "v-3", name: "Cargo 08", vin: "VIN0003", status: "maintenance", make: "Kavia", model: "Cargo", year: 2021, batteryLevel: 65, lastSeen: new Date(Date.now() - 560000).toISOString(), charging: false },
];

// PUBLIC_INTERFACE
export const vehiclesApi = {
  /** List vehicles with optional query params (e.g., status, search). */
  list: async (query = {}, meta) => {
    if (Config.MOCK_MODE) {
      const status = (query.status || "all").toLowerCase();
      const items = MOCK_VEHICLES.filter(v => status === "all" || (v.status || "").toLowerCase() === status);
      return { items };
    }
    const qs = new URLSearchParams(query).toString();
    return api.get(`/vehicles${qs ? `?${qs}` : ""}`, meta);
  },
  /** Retrieve a vehicle by ID. */
  get: async (id, meta) => {
    if (Config.MOCK_MODE) {
      return MOCK_VEHICLES.find(v => v.id === String(id)) || null;
    }
    return api.get(`/vehicles/${encodeURIComponent(id)}`, meta);
  },
  /** Create a new vehicle. */
  create: (payload, meta) => {
    if (Config.MOCK_MODE) {
      const v = { id: `v-${MOCK_VEHICLES.length + 1}`, ...payload };
      MOCK_VEHICLES.push(v);
      return Promise.resolve(v);
    }
    return api.post(`/vehicles`, payload, meta);
  },
  /** Update vehicle fields. */
  update: (id, payload, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_VEHICLES.findIndex(v => v.id === String(id));
      if (idx >= 0) {
        MOCK_VEHICLES[idx] = { ...MOCK_VEHICLES[idx], ...payload };
        return Promise.resolve(MOCK_VEHICLES[idx]);
      }
      return Promise.resolve(null);
    }
    return api.put(`/vehicles/${encodeURIComponent(id)}`, payload, meta);
  },
  /** Delete a vehicle by ID. */
  remove: (id, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_VEHICLES.findIndex(v => v.id === String(id));
      if (idx >= 0) MOCK_VEHICLES.splice(idx, 1);
      return Promise.resolve({ ok: true });
    }
    return api.delete(`/vehicles/${encodeURIComponent(id)}`, meta);
  },

  /** Assign driver to a vehicle. */
  assignDriver: (id, driverId, meta) => {
    if (Config.MOCK_MODE) {
      return Promise.resolve({ ok: true, id, driverId });
    }
    return api.post(`/vehicles/${encodeURIComponent(id)}/assign`, { driverId }, meta);
  },
  /** Unassign driver from a vehicle. */
  unassignDriver: (id, meta) => {
    if (Config.MOCK_MODE) {
      return Promise.resolve({ ok: true, id });
    }
    return api.post(`/vehicles/${encodeURIComponent(id)}/unassign`, {}, meta);
  },
};
