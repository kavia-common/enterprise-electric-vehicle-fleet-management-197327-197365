import React from "react";
import "./App.css";
import AppRouter from "./components/AppRouter";
import { AppProvider } from "./state/store";
import { AuthProvider } from "./context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Root App component that wires up providers and renders the router.
 */
function App() {
  return (
    <div className="App">
      <AppProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AppProvider>
    </div>
  );
}

export default App;
