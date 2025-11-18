import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { routes } from "../routes";

/**
 * PUBLIC_INTERFACE
 * AppRouter wraps routes within the application Layout.
 */
const AppRouter = () => {
  return (
    <Layout>
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </Layout>
  );
};

export default AppRouter;
