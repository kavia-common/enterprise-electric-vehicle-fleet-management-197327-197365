/**
 * PUBLIC_INTERFACE
 * Minimal API client built on fetch with JSON helpers and base URL.
 */
import { Config } from "./config";

async function request(path, options = {}) {
  const url = `${Config.apiBase}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const resp = await fetch(url, { ...options, headers });
  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!resp.ok) {
    const error = new Error(data?.message || `Request failed: ${resp.status}`);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body || {}) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
