import { useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { api } from "./api/client";
import { useRealtime } from "./context/RealtimeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Slides from "./pages/Slides";
import DeliveryGoals from "./pages/DeliveryGoals";
import Alerts from "./pages/Alerts";
import Orders from "./pages/Orders";
import Discounts from "./pages/Discounts";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

/**
 * អនុវត្ត Branding លើ Browser Tab៖
 * - document.title = site_name (ពី Database)
 * - favicon (icon) = site_logo (ពី Database)
 */
function applyBranding(settings = {}) {
  const fallback = "Admin Dashboard";
  const name = (settings.site_name || "").trim();
  const title = name ? `${name} — Admin` : fallback;
  if (document.title !== title) document.title = title;

  try {
    if (name) localStorage.setItem("site_name", name);
  } catch (e) {}

  const logo = (settings.site_logo || "").trim();
  const targetUrl = logo || "/favicon.ico";

  try {
    if (logo) localStorage.setItem("site_logo", logo);
  } catch (e) {}

  // រក MIME type
  let mime = "";
  const clean = targetUrl.split("?")[0].toLowerCase();
  if (clean.endsWith(".svg")) mime = "image/svg+xml";
  else if (clean.endsWith(".png")) mime = "image/png";
  else if (clean.endsWith(".ico")) mime = "image/x-icon";
  else if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) mime = "image/jpeg";
  else if (clean.endsWith(".webp")) mime = "image/webp";

  // លុប Tag ចាស់ៗចេញទាំងអស់ រួចបញ្ចូល Tag ថ្មីដើម្បីបង្ខំឱ្យ Browser ប្តូរភ្លាមៗ
  const oldIcons = document.querySelectorAll(
    "link[rel*='icon'], link[rel='apple-touch-icon']"
  );
  oldIcons.forEach((el) => el.remove());

  // 1. Primary Favicon
  const icon = document.createElement("link");
  icon.rel = "icon";
  if (mime) icon.type = mime;
  icon.href = targetUrl;
  document.head.appendChild(icon);

  // 2. Shortcut Icon
  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  if (mime) shortcut.type = mime;
  shortcut.href = targetUrl;
  document.head.appendChild(shortcut);

  // 3. Apple Touch Icon
  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = logo || "/apple-touch-icon.png";
  document.head.appendChild(apple);
}

export default function App() {
  const { user } = useAuth();

  // ដាក់ Title + Icon (Favicon) ពី Database (site_name / site_logo)
  const loadBranding = useCallback(() => {
    api
      .getSettings()
      .then(applyBranding)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  // Real-time: Admin កែ Site Name / Logo -> Title + Favicon បច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("settings_changed", loadBranding);

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
        <Route path="profile" element={<Profile />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="slides" element={<Slides />} />
        <Route path="delivery-goals" element={<DeliveryGoals />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="*"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

