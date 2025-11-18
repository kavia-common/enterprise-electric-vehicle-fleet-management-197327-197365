import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { routes } from "../routes";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";

/**
 * PUBLIC_INTERFACE
 * AppRouter wires routes within the application Layout, adding protection for core routes.
 */
const AppRouter = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        {routes.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={<ProtectedRoute>{r.element}</ProtectedRoute>}
          />
        ))}
      </Routes>
    </Layout>
  );
};

export default AppRouter;
