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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadSite = useCallback(() => {
    api
      .getSettings()
      .then(setSite)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  // បិទ Mobile Drawer ពេលប្តូរទំព័រ
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 bg-slate-900 flex-col z-30">
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
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (slide-over from left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 z-50 flex flex-col shadow-2xl animate-fade-in">
            <div className="h-16 flex items-center justify-between px-5 text-white font-extrabold text-base border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="h-7 w-auto max-w-[120px] object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <Store className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <span className="truncate">{siteName}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 truncate">
                {user?.email}
              </div>
              <HeaderControls dark />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-3 sm:px-6 transition-colors gap-2">
          {/* Mobile hamburger + Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                className="h-7 w-auto max-w-[100px] xs:max-w-[130px] object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white truncate">
                <Store className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[100px] xs:max-w-[140px]">{siteName}</span>
              </div>
            )}
          </div>

          <div className="hidden lg:block text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
            {site.site_name
              ? `${site.site_name} ${t("nav.management")}`
              : t("nav.adminPanel")}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Real-time indicator */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full transition-colors duration-300 ${
                online
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
              title={t("common.autoRefresh")}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span className="hidden xs:inline">{t("common.live")}</span>
            </span>

            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block max-w-[160px] truncate">
              {user?.email}
            </span>

            {/* Language & Theme Controls — visible on both mobile and desktop */}
            <HeaderControls />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 shrink-0"
              title={t("nav.logout")}
              aria-label={t("nav.logout")}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </button>
          </div>
        </header>

        {/* Mobile quick tab nav */}
        <nav className="lg:hidden bg-slate-900 px-2 py-2 flex gap-1 overflow-x-auto sticky top-16 z-20 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <main className="p-3 sm:p-6 max-w-7xl">
          {/* Page transition animation ពេលប្តូរទំព័រ */}
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
