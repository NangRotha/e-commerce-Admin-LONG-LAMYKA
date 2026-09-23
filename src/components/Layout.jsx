import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
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
  Search,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "./HeaderControls";

const NAV_ITEMS = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard, color: "text-purple-500 bg-purple-100 dark:bg-purple-950/60" },
  { to: "/products", key: "nav.products", icon: Package, color: "text-amber-500 bg-amber-100 dark:bg-amber-950/60" },
  { to: "/categories", key: "nav.categories", icon: Tags, color: "text-rose-500 bg-rose-100 dark:bg-rose-950/60" },
  { to: "/slides", key: "nav.slides", icon: GalleryHorizontal, color: "text-sky-500 bg-sky-100 dark:bg-sky-950/60" },
  { to: "/delivery-goals", key: "nav.deliveryGoals", icon: Gift, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60" },
  { to: "/alerts", key: "nav.alerts", icon: BellRing, color: "text-pink-500 bg-pink-100 dark:bg-pink-950/60" },
  { to: "/orders", key: "nav.orders", icon: ShoppingCart, color: "text-blue-500 bg-blue-100 dark:bg-blue-950/60" },
  { to: "/discounts", key: "nav.discounts", icon: TicketPercent, color: "text-violet-500 bg-violet-100 dark:bg-violet-950/60" },
  { to: "/users", key: "nav.users", icon: Users, color: "text-teal-500 bg-teal-100 dark:bg-teal-950/60" },
  { to: "/settings", key: "nav.settings", icon: SettingsIcon, color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
];

/**
 * 3D Claymorphic Admin Layout
 * Styled with soft lilac sidebar, 3D avatar, greetings, and clay controls.
 */
export default function Layout() {
  const { user, logout, profileAvatar, profileName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const [site, setSite] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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

  // Friendly user greeting name (prefer profileName over email)
  const rawName = profileName || user?.email?.split("@")[0] || "Emily";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  // Real avatar URL (uploaded) or fallback to /avatar_clay.jpg
  const avatarSrc = profileAvatar || "/avatar_clay.jpg";

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: `Good morning, ${displayName}!`, icon: "☁️" };
    if (hour < 18) return { text: `Good afternoon, ${displayName}!`, icon: "☀️" };
    return { text: `Good evening, ${displayName}!`, icon: "🌙" };
  }, [displayName]);

  return (
    <div className="min-h-screen admin-mesh-bg text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Desktop Sidebar (Left Floating Claymorphic Column) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 p-4 z-30 flex-col">
        <div className="clay-card-purple h-full w-full flex flex-col overflow-hidden p-4 border border-white/80 dark:border-purple-900/30">
          {/* Profile Section (3D Avatar + Greeting) */}
          <div className="flex flex-col items-center text-center pt-2 pb-5 border-b border-purple-200/50 dark:border-purple-900/40">
            <div className="relative group mb-3">
              <Link to="/profile" className="block">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-md shadow-purple-300/40 dark:shadow-none bg-[#f6f0fc]" style={{border:'3px solid white'}}>
                  <img
                    src={avatarSrc}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                    style={{ transform: 'scale(1.1)' }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                {/* Camera icon overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <span className="text-white text-xs font-bold">Edit</span>
                </div>
              </Link>
            </div>
            <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>Hi, {displayName}!</span>
              <span className="inline-block animate-bounce" style={{ animationDuration: "2s" }}>👋</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-purple-200/70 font-medium mt-0.5">
              Good to see you again
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "clay-nav-active"
                        : "text-slate-600 dark:text-purple-200/70 hover:text-purple-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 hover:translate-x-1"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? "bg-white/25 text-white"
                            : item.color
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{t(item.key)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Bottom Card: Take breaks, stay positive */}
          <div className="pt-2">
            <div className="bg-white/70 dark:bg-purple-950/40 rounded-2xl p-3 text-center border border-white/80 dark:border-purple-900/40 shadow-xs flex flex-col items-center gap-1.5 transition-all hover:bg-white/90">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs border border-white bg-pink-50">
                <img
                  src="/plant_clay.jpg"
                  alt="Clay plant"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] font-bold text-slate-700 dark:text-purple-200 leading-tight">
                Take breaks,<br />stay positive 🌸
              </p>
            </div>

            {/* Logout shortcut button */}
            <div className="mt-2.5 flex items-center justify-between px-1">
              <span className="text-[10px] text-purple-400 font-semibold truncate max-w-[140px]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                title={t("nav.logout")}
                aria-label={t("nav.logout")}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (slide-over from left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] clay-card-purple border-r border-white/80 z-50 flex flex-col shadow-2xl animate-fade-in p-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-200/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
                  <img src="/avatar_clay.jpg" alt="Avatar" className="w-full h-full object-cover scale-125" />
                </div>
                <div>
                  <span className="font-black text-slate-800 dark:text-white text-sm">
                    Hi, {displayName}! 👋
                  </span>
                  <div className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold">
                    Admin Console
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="clay-circle-btn w-8 h-8 flex items-center justify-center text-slate-500"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "clay-nav-active"
                        : "text-slate-600 hover:bg-white/60"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{t(item.key)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-purple-200/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition"
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
        {/* Claymorphic Topbar matching the image */}
        <header className="sticky top-0 z-20 bg-[#fbf8f5]/85 dark:bg-[#120e1a]/85 backdrop-blur-md px-4 sm:px-8 pt-4 pb-3 flex items-center justify-between gap-4">
          {/* Mobile hamburger & Title */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="clay-circle-btn w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                {t(currentNav.key)}
              </h1>
              <p className="text-[11px] text-slate-500">
                {siteName}
              </p>
            </div>
          </div>

          {/* Desktop Left: "Good morning, Emily! ☁️" */}
          <div className="hidden lg:block">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <span>{greeting.text}</span>
              <span className="text-lg">{greeting.icon}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Here's what's happening today.
            </p>
          </div>

          {/* Right Header Buttons: Circular Clay Buttons (Search, Notification, Profile, etc.) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search circular button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(!searchModalOpen)}
              className="clay-circle-btn w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification button with pink '3' badge */}
            <Link
              to="/alerts"
              className="clay-circle-btn w-10 h-10 relative flex items-center justify-center text-slate-600 dark:text-slate-300"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff6b8b] text-white text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900">
                3
              </span>
            </Link>

            {/* User Profile Circle → links to /profile */}
            <Link
              to="/profile"
              className="clay-circle-btn w-10 h-10 p-0.5 overflow-hidden flex items-center justify-center"
              title="My Profile"
              aria-label="Profile"
            >
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </Link>

            {/* Language & Theme Controls */}
            <HeaderControls />

            {/* Storefront Link shortcut */}
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              title="Open storefront"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 clay-circle-btn"
            >
              <Store className="w-3.5 h-3.5 text-purple-500" />
              <span>Store</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </header>

        {/* Quick Mobile Category Tabs */}
        <nav className="lg:hidden px-3 py-2 flex gap-1.5 overflow-x-auto sticky top-16 z-10 scrollbar-none bg-[#fbf8f5]/90 dark:bg-[#120e1a]/90 backdrop-blur-xs">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "clay-nav-active shadow-xs"
                    : "bg-white/80 dark:bg-purple-950/40 text-slate-600 dark:text-slate-300 border border-purple-100"
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
