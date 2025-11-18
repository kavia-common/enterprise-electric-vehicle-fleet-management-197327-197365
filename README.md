# enterprise-electric-vehicle-fleet-management-197327-197365

This repository contains the Enterprise EV Fleet Frontend.

Key environment notes:
- REACT_APP_API_BASE: HTTP base for REST API (e.g., http://localhost:3001)
- REACT_APP_WS_URL: Optional WebSocket endpoint. If unset, the frontend auto-derives the WS URL:
  - Uses wss:// when the page is served over HTTPS; uses ws:// for HTTP/local dev
  - Derives from REACT_APP_API_BASE or window.location with a default path of /ws
  - If not derivable, WS features are disabled gracefully so the app can still be used