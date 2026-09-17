import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  GalleryHorizontal,
  BellRing,
  ShoppingCart,
  TicketPercent,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "./HeaderControls";

const NAV_ITEMS = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/products", key: "nav.products", icon: Package },
  { to: "/categories", key: "nav.categories", icon: Tags },
  { to: "/slides", key: "nav.slides", icon: GalleryHorizontal },
  { to: "/alerts", key: "nav.alerts", icon: BellRing },
  { to: "/orders", key: "nav.orders", icon: ShoppingCart },
  { to: "/discounts", key: "nav.discounts", icon: TicketPercent },
  { to: "/users", key: "nav.users", icon: Users },
  { to: "/settings", key: "nav.settings", icon: SettingsIcon },
];

/**
 * Layout — Admin Panel
 * ✅ ប៊ូតុងប្តូរភាសា (ខ្មែរ/English) និង Theme (ភ្លឺ/ងងឹត)
 * ✅ Real-time indicator (WebSocket) — ទិន្នន័យបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ
 * ✅ Page transition animation ពេលប្តូរទំព័រ
 */
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  // ឈ្មោះ + Logo របស់ Store ពី Database (site_name / site_logo)
  const [site, setSite] = useState({});

  const loadSite = useCallback(() => {
    api
      .getSettings()
      .then(setSite)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  // Real-time: Admin កែ Site Name / Logo -> Sidebar បច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("settings_changed", loadSite);
  // Live indicator (ស្ថានភាពតភ្ជាប់ WebSocket)
  const online = useRealtime("orders_changed", () => {});

  const siteName = site.site_name || t("nav.adminPanel");
  const siteLogo = site.site_logo || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
        : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 bg-slate-900 flex-col">
        <div className="h-16 flex items-center gap-2 px-5 text-white font-extrabold text-lg border-b border-slate-800">
          {siteLogo ? (
            <img
              src={siteLogo}
              alt={siteName}
              className="h-8 w-auto max-w-[130px] object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <Store className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <span className="truncate">{siteName}</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="px-4 py-2 text-sm text-slate-400 truncate">
            {user?.email}
          </div>
          <HeaderControls dark />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-rose-600/20 hover:text-rose-400 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden font-extrabold text-slate-900">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                className="h-7 w-auto max-w-[120px] object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <Store className="w-5 h-5 text-emerald-600" />
            )}
            {!siteLogo && <span className="truncate">{siteName}</span>}
          </div>
          <div className="hidden lg:block text-sm text-slate-500">
            {site.site_name
              ? `${site.site_name} ${t("nav.management")}`
              : t("nav.adminPanel")}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time indicator */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-colors duration-300 ${
                online
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              title={t("common.autoRefresh")}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {t("common.live")}
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.email}
            </span>
            <HeaderControls className="hidden sm:flex" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden bg-slate-900 px-2 py-2 flex gap-1 overflow-x-auto sticky top-16 z-20">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <main className="p-4 sm:p-6 max-w-7xl">
          {/* Page transition animation ពេលប្តូរទំព័រ */}
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
