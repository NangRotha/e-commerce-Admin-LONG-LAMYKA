import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Sparkles,
} from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const STATUS_CONFIG = {
  pending: {
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60",
    icon: Clock,
  },
  paid: {
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60",
    icon: CheckCircle2,
  },
  shipped: {
    cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60",
    icon: Truck,
  },
  cancelled: {
    cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60",
    icon: XCircle,
  },
};

export default function Dashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time listeners
  useRealtime("orders_changed", load);
  useRealtime("products_changed", load);
  useRealtime("users_changed", load);

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 text-rose-700 dark:text-rose-300">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
      </div>
    );
  }

  const totalOrdersCount = stats.total_orders || 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title & Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-200/70 dark:border-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Real-Time Hub</span>
          </div>
        </div>
      </div>

      {/* KPI Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label={t("dashboard.totalProducts")}
          value={stats.total_products}
          accent="pink"
          trend="Inventory live"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label={t("dashboard.totalUsers")}
          value={stats.total_users}
          accent="blue"
          trend="Registered members"
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label={t("dashboard.totalOrders")}
          value={stats.total_orders}
          accent="amber"
          trend="Store sales"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label={t("dashboard.revenue")}
          value={formatPrice(stats.total_revenue)}
          accent="rose"
          trend="Gross volume"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 luxury-card rounded-[28px] p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-pink-100/70 dark:border-pink-950/70">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t("dashboard.recentOrders")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest customer purchases processed on store
              </p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recent_orders.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-12 text-center">
              {t("dashboard.noOrders")}
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recent_orders.map((o) => {
                const conf = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                const StatusIcon = conf.icon;
                const customerInit = (o.user_email?.[0] || "#").toUpperCase();
                return (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-pink-50/20 dark:bg-white/[0.02] border border-pink-100/60 dark:border-pink-950/60 hover:bg-pink-50/40 dark:hover:bg-pink-950/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                        {customerInit}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Order #{o.id} · <span className="font-normal text-slate-500 dark:text-slate-400">{o.user_email}</span>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(o.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs ${conf.cls}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{o.status}</span>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-base font-mono">
                        {formatPrice(o.total_amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Low Stock & Order Status Breakdown */}
        <div className="space-y-6">
          {/* Low stock */}
          <div className="luxury-card rounded-[28px] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-pink-100/70 dark:border-pink-950/70">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-base">
                  {t("dashboard.lowStock")}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Products that need restocking soon
                </p>
              </div>
            </div>

            {stats.low_stock.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
                {t("dashboard.allStocked")}
              </p>
            ) : (
              <div className="space-y-2">
                {stats.low_stock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {p.name}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-lg shrink-0 ${
                        p.stock === 0
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60"
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60"
                      }`}
                    >
                      {p.stock} {t("dashboard.left")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by Status visual progress */}
          <div className="luxury-card rounded-[28px] p-5 sm:p-6 shadow-xs">
            <h2 className="font-black text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-pink-100/70 dark:border-pink-950/70">
              {t("dashboard.ordersByStatus")}
            </h2>
            <div className="space-y-3">
              {Object.keys(stats.orders_by_status).length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                  {t("dashboard.noOrders")}
                </p>
              )}
              {Object.entries(stats.orders_by_status).map(([status, count]) => {
                const pct = Math.min(100, Math.round((count / totalOrdersCount) * 100));
                const barColors = {
                  paid: "bg-emerald-500",
                  pending: "bg-amber-500",
                  shipped: "bg-blue-500",
                  cancelled: "bg-rose-500",
                };
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300 capitalize flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${barColors[status] || "bg-pink-500"}`} />
                        {status}
                      </span>
                      <span className="text-slate-900 dark:text-white font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColors[status] || "bg-pink-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
