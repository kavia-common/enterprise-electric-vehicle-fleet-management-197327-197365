 /**
  * PUBLIC_INTERFACE
  * Lightweight global error suppression utilities for MOCK_MODE.
  * - Suppresses repeated 404 messages and noisy network errors when Config.MOCK_MODE is true.
  * - Provides a shouldToastError helper for UI layers.
  */
import { Config } from "../services/config";

const seen404Keys = new Map(); // key -> count

function keyFromError(err) {
  const status = err?.status || "network";
  const msg = String(err?.message || "");
  return `${status}:${msg}`;
}

// PUBLIC_INTERFACE
export function shouldToastError(err) {
  /** Returns false when error should be suppressed (mock mode 404s), true otherwise. */
  if (!err) return false;
  if (!Config.MOCK_MODE) return true;

  const status = err?.status;
  if (status === 404) {
    const key = keyFromError(err);
    const count = seen404Keys.get(key) || 0;
    seen404Keys.set(key, count + 1);
    // allow first occurrence for visibility, suppress subsequent repeats
    return count === 0;
  }
  return true;
}

// PUBLIC_INTERFACE
export function logError(err, context = "") {
  /** Console logs errors unless suppressed; keeps output tidy in mock mode. */
  if (!err) return;
  if (Config.MOCK_MODE && err?.status === 404) {
    // Silent for repeated 404s
    if (!shouldToastError(err)) return;
  }
  // eslint-disable-next-line no-console
  console.warn("[UI]", context, err?.message || err);
}
