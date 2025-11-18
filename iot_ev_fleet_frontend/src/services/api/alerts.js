 /**
  * PUBLIC_INTERFACE
  * Alerts API client for creating, listing, acknowledging, and deleting alerts.
  */
import { api } from "../apiClient";

// PUBLIC_INTERFACE
export const alertsApi = {
  list: (query = {}, meta) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/alerts${qs ? `?${qs}` : ""}`, meta);
  },
  get: (id, meta) => api.get(`/alerts/${encodeURIComponent(id)}`, meta),
  create: (payload, meta) => api.post(`/alerts`, payload, meta),
  acknowledge: (id, meta) =>
    api.post(`/alerts/${encodeURIComponent(id)}/ack`, {}, meta),
  remove: (id, meta) => api.delete(`/alerts/${encodeURIComponent(id)}`, meta),
};
