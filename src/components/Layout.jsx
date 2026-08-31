import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/slides", label: "Slides", icon: GalleryHorizontal },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/discounts", label: "Discounts", icon: TicketPercent },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ឈ្មោះ + Logo របស់ Store ពី Database (site_name / site_logo)
  const [site, setSite] = useState({});
  useEffect(() => {
    api
      .getSettings()
      .then(setSite)
      .catch(() => {});
  }, []);

  const siteName = site.site_name || "Admin Panel";
  const siteLogo = site.site_logo || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-emerald-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
              className="h-8 w-auto max-w-[130px] object-contain"
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
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="px-4 py-2 text-sm text-slate-400 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-rose-600/20 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
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
              ? `${site.site_name} Management`
              : "E-Commerce Store Management"}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
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
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="p-4 sm:p-6 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
