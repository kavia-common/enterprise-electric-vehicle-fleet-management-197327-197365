 /**
  * PUBLIC_INTERFACE
  * Barrel exports for services.
  * - api client
  * - domain api modules
  * - telemetry websocket client
  */
export { api } from "./apiClient";
export { Config } from "./config";

// Domain REST modules
export { vehiclesApi } from "./api/vehicles";
export { chargingApi } from "./api/charging";
export { alertsApi } from "./api/alerts";
export { usersApi } from "./api/users";

// WebSocket telemetry
export { TelemetryClient, createTelemetryClient } from "./ws/telemetryClient";
