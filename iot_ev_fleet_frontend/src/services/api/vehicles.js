 /**
  * PUBLIC_INTERFACE
  * Vehicles API client.
  * Provides typed helpers for listing, retrieving, creating, updating, and deleting vehicles,
  * plus domain actions like assign/unassign.
  */
import { api } from "../apiClient";

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

// PUBLIC_INTERFACE
export const vehiclesApi = {
  /** List vehicles with optional query params (e.g., status, search). */
  list: (query = {}, meta) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/vehicles${qs ? `?${qs}` : ""}`, meta);
  },
  /** Retrieve a vehicle by ID. */
  get: (id, meta) => api.get(`/vehicles/${encodeURIComponent(id)}`, meta),
  /** Create a new vehicle. */
  create: (payload, meta) => api.post(`/vehicles`, payload, meta),
  /** Update vehicle fields. */
  update: (id, payload, meta) =>
    api.put(`/vehicles/${encodeURIComponent(id)}`, payload, meta),
  /** Delete a vehicle by ID. */
  remove: (id, meta) => api.delete(`/vehicles/${encodeURIComponent(id)}`, meta),

  /** Assign driver to a vehicle. */
  assignDriver: (id, driverId, meta) =>
    api.post(`/vehicles/${encodeURIComponent(id)}/assign`, { driverId }, meta),
  /** Unassign driver from a vehicle. */
  unassignDriver: (id, meta) =>
    api.post(`/vehicles/${encodeURIComponent(id)}/unassign`, {}, meta),
};
