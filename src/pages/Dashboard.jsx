import { useCallback, useEffect, useState } from "react";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
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

  // Real-time: Order ថ្មី / ផលិតផលផ្លាស់ប្តូរ -> Dashboard បច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("orders_changed", load);
  useRealtime("products_changed", load);
  useRealtime("users_changed", load);

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={<Package className="w-6 h-6" />} label={t("dashboard.totalProducts")} value={stats.total_products} accent="pink" />
        <StatCard icon={<Users className="w-6 h-6" />} label={t("dashboard.totalUsers")} value={stats.total_users} accent="blue" />
        <StatCard icon={<ShoppingCart className="w-6 h-6" />} label={t("dashboard.totalOrders")} value={stats.total_orders} accent="amber" />
        <StatCard icon={<DollarSign className="w-6 h-6" />} label={t("dashboard.revenue")} value={formatPrice(stats.total_revenue)} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#160f1c] rounded-3xl border border-pink-100/80 dark:border-pink-950/50 p-4 sm:p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">
            {t("dashboard.recentOrders")}
          </h2>
          {stats.recent_orders.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
              {t("dashboard.noOrders")}
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recent_orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-pink-50 dark:border-pink-950/40 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      #{o.id} · {o.user_email}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}
                    >
                      {o.status}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {formatPrice(o.total_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white dark:bg-[#160f1c] rounded-3xl border border-pink-100/80 dark:border-pink-950/50 p-4 sm:p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t("dashboard.lowStock")}
          </h2>
          {stats.low_stock.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
              {t("dashboard.allStocked")}
            </p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {p.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      p.stock === 0
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {p.stock} {t("dashboard.left")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-bold text-slate-900 dark:text-white mt-6 mb-3">
            {t("dashboard.ordersByStatus")}
          </h2>
          <div className="space-y-1.5">
            {Object.keys(stats.orders_by_status).length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">{t("dashboard.noOrders")}</p>
            )}
            {Object.entries(stats.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 capitalize">{status}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
