import React from "react";
import "./App.css";
import AppRouter from "./components/AppRouter";
import { AppProvider } from "./state/store";

/**
 * PUBLIC_INTERFACE
 * Root App component that wires up providers and renders the router.
 */
function App() {
  return (
    <div className="App">
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </div>
  );
}

export default App;
