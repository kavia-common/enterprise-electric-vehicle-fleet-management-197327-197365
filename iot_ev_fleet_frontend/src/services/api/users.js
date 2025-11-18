 /**
  * PUBLIC_INTERFACE
  * Users API client.
  * Includes self profile endpoints and admin user management.
  */
import { api } from "../apiClient";
import { Config } from "../config";

let MOCK_USERS = [
  { id: "u-1", email: "manager@example.com", name: "manager", role: "admin" },
  { id: "u-2", email: "ops@example.com", name: "ops", role: "viewer" },
];

// PUBLIC_INTERFACE
export const usersApi = {
  // Self
  me: (meta) => {
    if (Config.MOCK_MODE) {
      return Promise.resolve({ id: "u-1", email: "manager@example.com", name: "manager", role: "admin" });
    }
    return api.get(`/users/me`, meta);
  },
  updateMe: (payload, meta) => {
    if (Config.MOCK_MODE) {
      MOCK_USERS[0] = { ...MOCK_USERS[0], ...payload };
      return Promise.resolve(MOCK_USERS[0]);
    }
    return api.put(`/users/me`, payload, meta);
  },

  // Admin
  list: (query = {}, meta) => {
    if (Config.MOCK_MODE) {
      return Promise.resolve({ items: MOCK_USERS.slice(), total: MOCK_USERS.length });
    }
    const qs = new URLSearchParams(query).toString();
    return api.get(`/users${qs ? `?${qs}` : ""}`, meta);
  },
  get: (id, meta) => {
    if (Config.MOCK_MODE) {
      return Promise.resolve(MOCK_USERS.find(u => u.id === String(id)) || null);
    }
    return api.get(`/users/${encodeURIComponent(id)}`, meta);
  },
  create: (payload, meta) => {
    if (Config.MOCK_MODE) {
      const u = { id: `u-${MOCK_USERS.length + 1}`, ...payload };
      MOCK_USERS.push(u);
      return Promise.resolve(u);
    }
    return api.post(`/users`, payload, meta);
  },
  update: (id, payload, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_USERS.findIndex(u => u.id === String(id));
      if (idx >= 0) {
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...payload };
        return Promise.resolve(MOCK_USERS[idx]);
      }
      return Promise.resolve(null);
    }
    return api.put(`/users/${encodeURIComponent(id)}`, payload, meta);
  },
  remove: (id, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_USERS.findIndex(u => u.id === String(id));
      if (idx >= 0) MOCK_USERS.splice(idx, 1);
      return Promise.resolve({ ok: true });
    }
    return api.delete(`/users/${encodeURIComponent(id)}`, meta);
  },
  setRole: (id, role, meta) => {
    if (Config.MOCK_MODE) {
      const idx = MOCK_USERS.findIndex(u => u.id === String(id));
      if (idx >= 0) MOCK_USERS[idx] = { ...MOCK_USERS[idx], role };
      return Promise.resolve({ ok: true, id, role });
    }
    return api.post(`/users/${encodeURIComponent(id)}/role`, { role }, meta);
  },
};
