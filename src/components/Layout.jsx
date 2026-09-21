import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  GalleryHorizontal,
  BellRing,
  Gift,
  ShoppingCart,
  TicketPercent,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Store,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
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
  { to: "/delivery-goals", key: "nav.deliveryGoals", icon: Gift },
  { to: "/alerts", key: "nav.alerts", icon: BellRing },
  { to: "/orders", key: "nav.orders", icon: ShoppingCart },
  { to: "/discounts", key: "nav.discounts", icon: TicketPercent },
  { to: "/users", key: "nav.users", icon: Users },
  { to: "/settings", key: "nav.settings", icon: SettingsIcon },
];

/**
 * Layout — Luxury Admin Panel
 * ✅ Elegant Satin Sidebar without duplicated controls
 * ✅ Floating Frosted Glass Header with Breadcrumbs & View Storefront shortcut
 * ✅ Real-time Live Sync Indicator
 * ✅ Modern Profile Avatar Card
 */
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

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

  // Close Mobile Drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Real-time site updates
  useRealtime("settings_changed", loadSite);
  const online = useRealtime("orders_changed", () => {});

  const siteName = site.site_name || t("nav.adminPanel");
  const siteLogo = site.site_logo || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Find active nav item for breadcrumb
  const currentNav = useMemo(() => {
    return (
      NAV_ITEMS.find(
        (item) =>
          location.pathname === item.to ||
          (item.to !== "/dashboard" && location.pathname.startsWith(item.to))
      ) || NAV_ITEMS[0]
    );
  }, [location.pathname]);

  // Storefront URL
  const storefrontUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5173"
      : "https://e-commerce-long-lamyka.vercel.app";

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-md shadow-pink-500/25 translate-x-1"
        : "text-slate-300/80 hover:text-white hover:bg-white/8 hover:translate-x-1"
    }`;

  const userInitial = (user?.email?.[0] || "A").toUpperCase();
  const userShort = user?.email?.split("@")[0] || "Admin";

  return (
    <div className="min-h-screen admin-mesh-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#140c1d] via-[#100816] to-[#0a0510] border-r border-pink-900/30 flex-col z-30 shadow-2xl">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-pink-950/40">
          {siteLogo ? (
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-pink-500/20 blur-xs group-hover:bg-pink-500/40 transition duration-300" />
              <img
                src={siteLogo}
                alt={siteName}
                className="relative h-9 w-auto max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
              <Store className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate bg-gradient-to-r from-white via-pink-100 to-pink-200 bg-clip-text text-transparent font-black tracking-tight text-base leading-tight">
              {siteName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-pink-300/70 uppercase tracking-wider">
                Store Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="truncate">{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer — Admin User Profile Card (No duplicates!) */}
        <div className="p-3 border-t border-pink-950/40">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-pink-500/30 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {userShort}
              </div>
              <div className="text-[10px] text-pink-300/80 font-medium flex items-center gap-1 truncate">
                <ShieldCheck className="w-3 h-3 text-pink-400 shrink-0" />
                <span>Administrator</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title={t("nav.logout")}
              aria-label={t("nav.logout")}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (slide-over from left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-gradient-to-b from-[#140c1d] via-[#100816] to-[#0a0510] border-r border-pink-950/40 z-50 flex flex-col shadow-2xl animate-fade-in">
            <div className="h-18 flex items-center justify-between px-5 text-white border-b border-pink-950/40">
              <div className="flex items-center gap-2.5 min-w-0">
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="h-8 w-auto max-w-[120px] object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                )}
                <span className="truncate font-black tracking-tight text-base bg-gradient-to-r from-white via-pink-100 to-pink-200 bg-clip-text text-transparent">
                  {siteName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="truncate">{t(item.key)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-pink-950/40 space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.email}
                  </div>
                  <div className="text-[10px] text-pink-300">Administrator</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Modern Frosted Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#120a1a]/85 backdrop-blur-xl border-b border-pink-100/70 dark:border-pink-900/30 h-16 sm:h-18 flex items-center justify-between px-3 sm:px-6 transition-colors gap-3 shadow-xs">
          {/* Mobile hamburger & Brand */}
          <div className="flex items-center gap-2 lg:hidden min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white truncate text-sm">
              <Store className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="truncate max-w-[120px]">{siteName}</span>
            </div>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-pink-300/60 font-medium">
              <span>{t("nav.adminPanel")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/50">
              <currentNav.icon className="w-4 h-4 text-pink-500" />
              <span className="font-bold text-slate-900 dark:text-white">
                {t(currentNav.key)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Storefront Link shortcut */}
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              title="Open storefront in new tab"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-300 bg-white dark:bg-[#181120] hover:bg-pink-50/80 dark:hover:bg-pink-950/40 border border-pink-100 dark:border-pink-950/70 shadow-2xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
              <span>View Store</span>
            </a>

            {/* Real-time indicator */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full border transition-all duration-300 ${
                online
                  ? "bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
              }`}
              title={t("common.autoRefresh")}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span className="hidden xs:inline">
                {online ? "Live" : "Offline"}
              </span>
            </span>

            {/* Language & Theme Controls */}
            <HeaderControls />

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-pink-100 dark:border-pink-950/80">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight max-w-[130px] truncate">
                  {userShort}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-pink-300/70">
                  Super Admin
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all duration-200 active:scale-95 shrink-0"
                title={t("nav.logout")}
                aria-label={t("nav.logout")}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Quick Tab Navigation */}
        <nav className="lg:hidden bg-gradient-to-r from-[#140c1d] via-[#100816] to-[#0a0510] border-b border-pink-950/40 px-2 py-2 flex gap-1.5 overflow-x-auto sticky top-16 z-20 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                    : "text-slate-300 hover:bg-white/10"
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Content Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
