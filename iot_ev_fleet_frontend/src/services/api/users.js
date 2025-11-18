 /**
  * PUBLIC_INTERFACE
  * Users API client.
  * Includes self profile endpoints and admin user management.
  */
import { api } from "../apiClient";

// PUBLIC_INTERFACE
export const usersApi = {
  // Self
  me: (meta) => api.get(`/users/me`, meta),
  updateMe: (payload, meta) => api.put(`/users/me`, payload, meta),

  // Admin
  list: (query = {}, meta) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/users${qs ? `?${qs}` : ""}`, meta);
  },
  get: (id, meta) => api.get(`/users/${encodeURIComponent(id)}`, meta),
  create: (payload, meta) => api.post(`/users`, payload, meta),
  update: (id, payload, meta) => api.put(`/users/${encodeURIComponent(id)}`, payload, meta),
  remove: (id, meta) => api.delete(`/users/${encodeURIComponent(id)}`, meta),
  setRole: (id, role, meta) => api.post(`/users/${encodeURIComponent(id)}/role`, { role }, meta),
};
