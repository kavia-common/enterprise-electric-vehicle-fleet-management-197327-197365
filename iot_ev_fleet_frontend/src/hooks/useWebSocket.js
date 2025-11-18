import { useEffect, useRef, useState } from "react";
import { Config } from "../services/config";

/**
 * PUBLIC_INTERFACE
 * Lightweight WebSocket hook.
 * - Connects to Config.wsUrl
 * - Exposes connection state and a send function
 */
export function useWebSocket(path = "") {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("DISCONNECTED");
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const url = path ? `${Config.wsUrl}${path}` : Config.wsUrl;
    setStatus("CONNECTING");
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => setStatus("CONNECTED");
    ws.onclose = () => setStatus("DISCONNECTED");
    ws.onerror = () => setStatus("ERROR");
    ws.onmessage = (evt) => setLastMessage(evt.data);

    return () => {
      try {
        ws.close();
      } catch (e) {
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
