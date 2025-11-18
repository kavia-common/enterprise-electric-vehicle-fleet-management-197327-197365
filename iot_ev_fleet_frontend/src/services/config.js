 /** 
  * PUBLIC_INTERFACE
  * Provides environment-driven configuration for API and WebSocket base URLs.
  * Automatically selects ws:// or wss:// based on current page protocol if REACT_APP_WS_URL is not set.
  * Falls back gracefully to disabling WS when URL cannot be derived.
  */

 /**
  * Derive a URL object safely, returns null on failure.
  */
function safeParseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * resolveWebSocketUrl
 * Derives a WebSocket URL with correct scheme and optional default path "/ws".
 * Priority:
 *  1) REACT_APP_WS_URL (used as-is if valid, but scheme is adjusted to match page protocol when host matches current host)
 *  2) Derive from REACT_APP_API_BASE by swapping http(s) -> ws(s) and appending "/ws"
 *  3) Derive from window.location (same host), using "/ws" and ws/wss based on location.protocol
 * If derivation fails, returns null, and callers should handle no-WS mode gracefully.
 */
function resolveWebSocketUrl() {
  const envWs = process.env.REACT_APP_WS_URL;
  const envApi = process.env.REACT_APP_API_BASE;

  const isBrowser = typeof window !== "undefined" && typeof window.location !== "undefined";
  const schemeFor = (proto) => (proto === "https:" ? "wss:" : "ws:");

  // 1) Use REACT_APP_WS_URL if provided; ensure it is valid.
  if (envWs) {
    const u = safeParseUrl(envWs);
    if (u) {
      // If page is https and same host, ensure scheme is wss
      if (isBrowser && u.hostname === window.location.hostname) {
        u.protocol = schemeFor(window.location.protocol);
      }
      return u.toString();
    }
  }

  // 2) Derive from API base if available
  if (envApi) {
    const apiU = safeParseUrl(envApi);
    if (apiU) {
      apiU.protocol = apiU.protocol === "https:" ? "wss:" : "ws:";
      const path = apiU.pathname?.replace(/\/+$/, "") || "";
      apiU.pathname = path + "/ws";
      return apiU.toString();
    }
  }

  // 3) Derive from window.location
  if (isBrowser) {
    const loc = window.location;
    const wsProto = schemeFor(loc.protocol);
    const host = loc.host;
    return `${wsProto}//${host}/ws`;
  }

  // 4) Could not derive
  return null;
}

/**
 * PUBLIC_INTERFACE
 * resolveApiBase
 * Returns the API base URL with a sensible default for development.
 */
function resolveApiBase() {
  return process.env.REACT_APP_API_BASE || "http://localhost:3001";
}

const apiBase = resolveApiBase();
const wsUrl = resolveWebSocketUrl();

// PUBLIC_INTERFACE
export const Config = {
  apiBase,
  wsUrl,
};
