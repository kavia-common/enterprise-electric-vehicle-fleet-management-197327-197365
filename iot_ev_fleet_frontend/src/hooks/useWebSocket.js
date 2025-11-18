import { useEffect, useRef, useState } from "react";
import { Config } from "../services/config";

/**
 * PUBLIC_INTERFACE
 * Lightweight WebSocket hook.
 * - Connects to Config.wsUrl
 * - Exposes connection state and a send function
 * - Gracefully no-ops if WS URL cannot be derived.
 */
export function useWebSocket(path = "") {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("DISCONNECTED");
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    // If WS URL is not available, warn and do not attempt to connect
    if (!Config.wsUrl) {
      console.warn(
        "[useWebSocket] No WebSocket URL available. Set REACT_APP_WS_URL or REACT_APP_API_BASE, or ensure app is served from a host where WS can be derived."
      );
      setStatus("DISABLED");
      return () => {};
    }

    const base = Config.wsUrl.replace(/\/+$/, "");
    const pathPart = String(path || "");
    const finalUrl = pathPart ? `${base}${pathPart.startsWith("/") ? "" : "/"}${pathPart}` : base;

    setStatus("CONNECTING");
    let ws;
    try {
      ws = new WebSocket(finalUrl);
    } catch (e) {
      console.warn("[useWebSocket] Failed to construct WebSocket:", e?.message || e);
      setStatus("ERROR");
      return () => {};
    }

    socketRef.current = ws;

    ws.onopen = () => setStatus("CONNECTED");
    ws.onclose = () => setStatus("DISCONNECTED");
    ws.onerror = () => setStatus("ERROR");
    ws.onmessage = (evt) => setLastMessage(evt.data);

    return () => {
      try {
        ws.close();
      } catch {
        // ignore
      }
    };
  }, [path]);

  const send = (data) => {
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(data);
    }
  };

  return { status, lastMessage, send };
}
