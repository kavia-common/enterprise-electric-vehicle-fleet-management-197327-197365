/**
 * PUBLIC_INTERFACE
 * Minimal API client built on fetch with JSON helpers and base URL.
 * - Automatically injects Authorization header if a token is available.
 * Token sourcing strategy (no direct coupling to hooks/components):
 *  1) Prefer an explicit token passed via options.meta?.token
 *  2) Fallback to localStorage "auth_token" set by AuthContext
 */
import { Config } from "./config";

/** Internal: best-effort getter for auth token without importing React hooks. */
function getAuthToken(metaToken) {
  if (metaToken) return metaToken;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

/**
 * Core request helper that merges headers and handles JSON encode/decode with errors.
 * options.meta?: { token?: string } allows overriding the token per-call.
 */
async function request(path, options = {}) {
  const url = `${Config.apiBase}${path}`;
  const token = getAuthToken(options?.meta?.token);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Strip meta from options before passing to fetch
  const { meta: _omitMeta, ...fetchOptions } = options;

  const resp = await fetch(url, { ...fetchOptions, headers });
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
  /** Perform a GET request. meta?: { token?: string } */
  get: (path, meta) => request(path, { method: "GET", meta }),
  /** Perform a POST request with JSON body. meta?: { token?: string } */
  post: (path, body, meta) =>
    request(path, { method: "POST", body: JSON.stringify(body ?? {}), meta }),
  /** Perform a PUT request with JSON body. meta?: { token?: string } */
  put: (path, body, meta) =>
    request(path, { method: "PUT", body: JSON.stringify(body ?? {}), meta }),
  /** Perform a DELETE request. meta?: { token?: string } */
  delete: (path, meta) => request(path, { method: "DELETE", meta }),
};
