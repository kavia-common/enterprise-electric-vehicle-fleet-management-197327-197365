/**
 * PUBLIC_INTERFACE
 * Minimal API client built on fetch with JSON helpers and base URL.
 * - Automatically injects Authorization header if a token is available.
 * - In MOCK_MODE and for known idempotent GET endpoints, 404 returns empty arrays/objects.
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

/** Known list/detail endpoints to gracefully coerce on 404. */
const GRACEFUL_ENDPOINTS = [
  /^\/vehicles(\/.*)?(\?.*)?$/i,
  /^\/alerts(\/.*)?(\?.*)?$/i,
  /^\/charging\/sessions(\/.*)?(\?.*)?$/i,
  /^\/charging\/stations(\/.*)?(\?.*)?$/i,
  /^\/users(\/.*)?(\?.*)?$/i,
];

/** Coerce sensible defaults for GET 404s. */
function defaultFor(path) {
  if (/\/users\/me$/i.test(path)) return null;
  // If it looks like a list endpoint -> array, otherwise object/null
  if (
    /\/vehicles($|[/?])/.test(path) ||
    /\/alerts($|[/?])/.test(path) ||
    /\/charging\/sessions($|[/?])/.test(path) ||
    /\/charging\/stations($|[/?])/.test(path) ||
    /\/users($|[/?])/.test(path)
  ) {
    return { items: [] };
  }
  return null;
}

/**
 * Core request helper that merges headers and handles JSON encode/decode with errors.
 * options.meta?: { token?: string, onError?: (err) => void, suppress404?: boolean } allows overriding the token per-call
 * and 404 suppression callback.
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
  const { meta: _omitMeta, onError, suppress404, ...fetchOptions } = options;

  try {
    const resp = await fetch(url, { ...fetchOptions, headers });
    const text = await resp.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!resp.ok) {
      const err = new Error(data?.message || `Request failed: ${resp.status}`);
      err.status = resp.status;
      err.data = data;

      // Graceful 404 handling for idempotent GETs in mock/no-DB mode
      const isGet = (fetchOptions.method || "GET").toUpperCase() === "GET";
      const isGraceful = GRACEFUL_ENDPOINTS.some((re) => re.test(path));
      if (resp.status === 404 && isGet && isGraceful) {
        // Optionally notify caller, then return defaults
        if (onError && !suppress404 && !Config.MOCK_MODE) {
          try { onError(err); } catch {}
        }
        return defaultFor(path);
      }

      // In MOCK_MODE we can downgrade some other 404s to user-friendly messages
      if (resp.status === 404 && Config.MOCK_MODE) {
        if (onError && !suppress404) {
          try { onError(err); } catch {}
        }
        // If not GET or not graceful endpoint, still throw but cleaner message
        err.message = "Not available in mock mode";
      }

      throw err;
    }
    return data;
  } catch (err) {
    // In MOCK_MODE suppress noisy network errors for GET graceful endpoints
    const isGet = (fetchOptions.method || "GET").toUpperCase() === "GET";
    const isGraceful = GRACEFUL_ENDPOINTS.some((re) => re.test(path));
    if (Config.MOCK_MODE && isGet && isGraceful && (err?.status === 404 || !err?.status)) {
      if (onError && !suppress404) {
        try { onError(err); } catch {}
      }
      return defaultFor(path);
    }
    // Surface error with clearer prefix
    if (err && typeof err.message === "string" && !/^Request failed/.test(err.message)) {
      // keep as-is
    } else if (err) {
      err.message = `API error: ${err.status || "network"}${err.status === 404 ? " (not found)" : ""}`;
    }
    throw err;
  }
}

// PUBLIC_INTERFACE
export const api = {
  /** Perform a GET request. meta?: { token?: string }, onError?: fn, suppress404?: boolean */
  get: (path, meta) => request(path, { method: "GET", meta }),
  /** Perform a POST request with JSON body. meta?: { token?: string }, onError?: fn */
  post: (path, body, meta) =>
    request(path, { method: "POST", body: JSON.stringify(body ?? {}), meta }),
  /** Perform a PUT request with JSON body. meta?: { token?: string }, onError?: fn */
  put: (path, body, meta) =>
    request(path, { method: "PUT", body: JSON.stringify(body ?? {}), meta }),
  /** Perform a DELETE request. meta?: { token?: string }, onError?: fn */
  delete: (path, meta) => request(path, { method: "DELETE", meta }),
};
