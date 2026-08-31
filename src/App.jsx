import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { api } from "./api/client";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Slides from "./pages/Slides";
import Alerts from "./pages/Alerts";
import Orders from "./pages/Orders";
import Discounts from "./pages/Discounts";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

/**
 * អនុវត្ត Branding លើ Browser Tab៖
 * - document.title = site_name (ពី Database)
 * - favicon (icon) = site_logo (ពី Database)
 */
function applyBranding(settings) {
  const fallback = "Admin Dashboard";
  const name = settings.site_name || fallback;
  const title = settings.site_name ? `${settings.site_name} — Admin` : fallback;
  if (document.title !== title) document.title = title;
  if (!name) return;

  const logo = settings.site_logo || "";
  if (!logo) return;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== logo) {
    link.setAttribute("href", logo);
    link.setAttribute(
      "type",
      logo.toLowerCase().endsWith(".svg") ? "image/svg+xml" : ""
    );
  }
}

export default function App() {
  const { user } = useAuth();

  // ដាក់ Title + Icon (Favicon) ពី Database (site_name / site_logo)
  useEffect(() => {
    api
      .getSettings()
      .then(applyBranding)
      .catch(() => {});
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="slides" element={<Slides />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

