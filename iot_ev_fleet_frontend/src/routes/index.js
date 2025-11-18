/**
 * PUBLIC_INTERFACE
 * Define application routes for the IoT EV Fleet Frontend.
 * Exports a route configuration array used by the AppRouter component.
 */
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Charging from "../pages/Charging";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import Alerts from "../pages/Alerts";

export const routes = [
  { path: "/", element: <Dashboard />, title: "Dashboard" },
  { path: "/vehicles", element: <Vehicles />, title: "Vehicles" },
  { path: "/charging", element: <Charging />, title: "Charging" },
  { path: "/alerts", element: <Alerts />, title: "Alerts" },
  { path: "/analytics", element: <Analytics />, title: "Analytics" },
  { path: "/settings", element: <Settings />, title: "Settings" },
];

// PUBLIC_INTERFACE
export function getNavLinks() {
  /** Returns the links used by the sidebar/topbar navigation. */
  return routes.map(r => ({ path: r.path, title: r.title }));
}
