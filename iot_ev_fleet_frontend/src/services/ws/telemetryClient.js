 /**
  * PUBLIC_INTERFACE
  * Telemetry WebSocket client with auto-reconnect and topic/vehicle subscriptions.
  * - Connects to Config.wsUrl (e.g., ws://host/ws)
  * - Supports scoped subscriptions by vehicleId and topic
  * - Best-effort Authorization via Bearer token (from localStorage)
  *
  * Usage:
  *   const client = new TelemetryClient();
  *   client.connect();
  *   const unsub = client.subscribe({ vehicleId: "veh-1", topic: "metrics" }, (msg) => {...});
  *   // later: unsub();
  *   // on teardown: client.close();
  */
import { Config } from "../../services/config";

/**
 * Simple backoff generator (ms): 0.5s, 1s, 2s, 4s, 4s, ...
 */
function backoffDelays() {
  const base = 500;
  let attempt = 0;
  return {
    next() {
      const delay = Math.min(base * Math.pow(2, attempt++), 4000);
      return delay;
    },
    reset() {
      attempt = 0;
    },
  };
}

/** Create a ws URL with optional path and token as query param (when header not supported). */
function buildWsUrl(base, path = "", token) {
  // Ensure no trailing slash duplication
  const url = path ? `${base}${path}` : base;
  const u = new URL(url);
  if (token) {
    // Some WS gateways do not allow auth headers; attach token as query fallback.
    u.searchParams.set("token", token);
  }
  return u.toString();
}

/** Get a bearer token from localStorage without React coupling. */
function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

/** Envelope protocol for subscribe/unsubscribe. */
const MSG_TYPE = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  PING: "ping",
};

/**
 * Subscription key helper for consistent mapping.
 */
function keyOf({ vehicleId, topic }) {
  return `${vehicleId || "*"}::${topic || "*"}`;
}

export class TelemetryClient {
  constructor({ path = "" } = {}) {
    this.path = path; // e.g., "/telemetry" or "/ws"
    this.ws = null;
    this.status = "DISCONNECTED";
    this.subscriptions = new Map(); // key -> Set<callback>
    this.backoff = backoffDelays();
    this._shouldReconnect = true;
    this._pingInterval = null;
  }

  /**
   * PUBLIC_INTERFACE
   * connect
   * Establish a WebSocket connection and auto-resubscribe existing topics.
   */
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const token = getToken();
    const wsUrl = buildWsUrl(Config.wsUrl, this.path, token);

    this.status = "CONNECTING";
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      this.status = "CONNECTED";
      this.backoff.reset();
      // Resubscribe existing topics
      for (const key of this.subscriptions.keys()) {
        const [vehicleId, topic] = key.split("::");
        this._send({
          type: MSG_TYPE.SUBSCRIBE,
          vehicleId: vehicleId === "*" ? undefined : vehicleId,
          topic: topic === "*" ? undefined : topic,
        });
      }
      this._startPing();
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        // Route to specific subscription callbacks if vehicle/topic provided, else broadcast
        const key = keyOf({ vehicleId: msg.vehicleId, topic: msg.topic });
        const anyTopicKey = keyOf({ vehicleId: msg.vehicleId, topic: "*" });
        const wildcardKey = keyOf({ vehicleId: "*", topic: "*" });

        const delivered = new Set();
        [key, anyTopicKey, wildcardKey].forEach((k) => {
          const subs = this.subscriptions.get(k);
          if (subs) {
            subs.forEach((cb) => {
              if (!delivered.has(cb)) {
                delivered.add(cb);
                cb(msg);
              }
            });
          }
        });
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      this.status = "ERROR";
    };

    ws.onclose = () => {
      this._stopPing();
      this.status = "DISCONNECTED";
      if (this._shouldReconnect) {
        const delay = this.backoff.next();
        setTimeout(() => this.connect(), delay);
      }
    };
  }

  /** INTERNAL: send helper */
  _send(obj) {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(obj));
      }
    } catch {
      // noop
    }
  }

  /** Start pinging every 25s to keep connections alive on proxies. */
  _startPing() {
    this._stopPing();
    this._pingInterval = setInterval(() => {
      this._send({ type: MSG_TYPE.PING, t: Date.now() });
    }, 25000);
  }

  _stopPing() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * subscribe
   * Subscribe to a telemetry stream.
   * @param {{vehicleId?: string, topic?: string}} scope
   * @param {(msg: any) => void} callback
   * @returns {() => void} unsubscribe function
   */
  subscribe(scope, callback) {
    const key = keyOf(scope || {});
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
      // Send subscribe to server if connected
      this._send({
        type: MSG_TYPE.SUBSCRIBE,
        vehicleId: scope?.vehicleId,
        topic: scope?.topic,
      });
    }
    const set = this.subscriptions.get(key);
    set.add(callback);

    // Return unsubscribe
    return () => {
      const current = this.subscriptions.get(key);
      if (!current) return;
      current.delete(callback);
      if (current.size === 0) {
        this.subscriptions.delete(key);
        // Notify server of unsubscribe
        this._send({
          type: MSG_TYPE.UNSUBSCRIBE,
          vehicleId: scope?.vehicleId,
          topic: scope?.topic,
        });
      }
    };
  }

  /**
   * PUBLIC_INTERFACE
   * close
   * Permanently close and stop reconnect attempts.
   */
  close() {
    this._shouldReconnect = false;
    this._stopPing();
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.status = "DISCONNECTED";
  }
}

/**
 * PUBLIC_INTERFACE
 * Factory helper to create and connect a client in one call.
 */
export function createTelemetryClient(options) {
  const client = new TelemetryClient(options);
  client.connect();
  return client;
}
