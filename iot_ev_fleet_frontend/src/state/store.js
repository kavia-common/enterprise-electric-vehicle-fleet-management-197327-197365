/**
 * PUBLIC_INTERFACE
 * Lightweight global state via React Context for app-wide theme/version placeholders.
 */
import React, { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [version] = useState("0.1.0");

  const value = useMemo(() => ({ version }), [version]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// PUBLIC_INTERFACE
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
