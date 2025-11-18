# IoT EV Fleet Frontend (React)

Modern, lightweight React frontend using the Ocean Professional theme for the Enterprise EV Fleet Management app.

## Features
- Ocean Professional theme (blue & amber accents, modern layout)
- Sidebar + topbar layout
- React Router v6 routes for Dashboard, Vehicles, Charging, Analytics, Settings
- Environment-driven API and WebSocket configuration
- Minimal dependencies, no heavy UI libraries

## Getting Started
Install dependencies and start the dev server:
```bash
npm install
npm start
```

## Environment Variables
Copy `.env.example` to `.env` and adjust as needed:
```
REACT_APP_API_BASE=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/ws
# Optional additional envs supported by the container:
REACT_APP_BACKEND_URL=
REACT_APP_FRONTEND_URL=
REACT_APP_NODE_ENV=development
REACT_APP_NEXT_TELEMETRY_DISABLED=1
REACT_APP_ENABLE_SOURCE_MAPS=true
REACT_APP_PORT=3000
REACT_APP_TRUST_PROXY=1
REACT_APP_LOG_LEVEL=info
REACT_APP_HEALTHCHECK_PATH=/health
REACT_APP_FEATURE_FLAGS=
REACT_APP_EXPERIMENTS_ENABLED=false
```

## Project Structure
```
src/
  components/
    AppRouter.jsx
    Layout.jsx
    ThemeToggle.jsx
  pages/
    Dashboard.jsx
    Vehicles.jsx
    Charging.jsx
    Analytics.jsx
    Settings.jsx
  services/
    apiClient.js
    config.js
  hooks/
    useWebSocket.js
  state/
    store.js
  routes/
    index.js
  App.js
  App.css
  index.js
```

## Notes
- Public interfaces are documented with PUBLIC_INTERFACE comments and JSDoc.
- Replace placeholders in pages with actual components and data as backend endpoints and WebSockets are implemented.
