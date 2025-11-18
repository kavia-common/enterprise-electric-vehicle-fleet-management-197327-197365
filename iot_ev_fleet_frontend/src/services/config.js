/**
 * PUBLIC_INTERFACE
 * Provides environment-driven configuration for API and WebSocket base URLs.
 */
const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:3001";
const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:3001/ws";

export const Config = {
  apiBase,
  wsUrl,
};
