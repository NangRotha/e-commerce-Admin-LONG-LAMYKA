import { useCallback, useEffect, useMemo, useState } from "react";
import { ShoppingCart, Search, Filter, Clock, CheckCircle2, Truck, XCircle, AlertCircle, Phone, Mail, MapPin } from "lucide-react";
import { api } from "../api/client";
import { formatPrice, formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const STATUSES = ["pending", "paid", "shipped", "cancelled"];

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60",
  shipped: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60",
  cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60",
};

export default function Orders() {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(
    () =>
      api
        .getOrders()
        .then(setOrders)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Real-time updates
  useRealtime("orders_changed", load);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    try {
      await api.updateOrderStatus(orderId, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status counts
  const counts = useMemo(() => {
    const map = { all: (orders || []).length, pending: 0, paid: 0, shipped: 0, cancelled: 0 };
    (orders || []).forEach((o) => {
      if (map[o.status] !== undefined) map[o.status] += 1;
    });
    return map;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders || []).filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchQuery =
        !q ||
        String(o.id).includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").includes(q) ||
        (o.user_email || "").toLowerCase().includes(q) ||
        (o.promo_code || "").toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, statusFilter, search]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("orders.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {orders ? t("orders.count", { count: orders.length }) : t("common.loading")}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="luxury-card rounded-[26px] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: t("orderStatus.all"), count: counts.all },
              { id: "pending", label: t("orderStatus.pending"), count: counts.pending },
              { id: "paid", label: t("orderStatus.paid"), count: counts.paid },
              { id: "shipped", label: t("orderStatus.shipped"), count: counts.shipped },
              { id: "cancelled", label: t("orderStatus.cancelled"), count: counts.cancelled },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 select-none ${
                    active
                      ? "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-sm shadow-pink-500/25 scale-[1.02]"
                      : "bg-pink-50/40 dark:bg-[#181120] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-pink-100/50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("orders.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-pink-50/20 dark:bg-[#140d1a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-xs sm:text-sm transition"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {orders === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400">
          {t("orders.noOrders")}
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">{t("orders.order")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.customer")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.shipping")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.items")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.total")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.status")}</th>
                <th className="px-5 py-4 font-bold">{t("orders.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {filteredOrders.map((o) => {
                const customerInit = (o.customer_name?.[0] || o.user_email?.[0] || "#").toUpperCase();
                return (
                  <tr
                    key={o.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm sm:text-base">
                          #{o.id}
                        </span>
                        {o.promo_code && (
                          <span className="text-[11px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60 px-2 py-0.5 rounded-full shadow-2xs">
                            {o.promo_code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {customerInit}
                        </div>
                        <div className="min-w-0">
                          <div className="text-slate-900 dark:text-slate-100 font-bold text-sm truncate">
                            {o.customer_name || "—"}
                          </div>
                          {o.customer_phone && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-pink-500" />
                              <span>{o.customer_phone}</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[160px]">
                              {o.user_email || o.customer_email || (
                                <span className="font-bold text-pink-600 dark:text-pink-400">
                                  {t("orders.guest")}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {o.shipping_company && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1 max-w-[240px] truncate" title={o.shipping_company}>
                          <span>🚚</span>
                          <span className="truncate">{o.shipping_company}</span>
                          {o.shipping_fee ? <span className="text-indigo-500 font-mono shrink-0">(${Number(o.shipping_fee).toFixed(2)})</span> : null}
                        </div>
                      )}
                      {o.shipping_address ? (
                        <div className="flex items-start gap-1.5 max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                          <span className="text-xs leading-relaxed line-clamp-2" title={o.shipping_address}>
                            {o.shipping_address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                      {o.note && (
                        <div className="mt-1 max-w-[240px] text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 rounded-lg p-1.5 line-clamp-2">
                          📝 {o.note}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {o.items.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="space-y-1">
                          {o.items.map((i, idx) => (
                            <div key={idx} className="flex items-center flex-wrap gap-1 text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {i.quantity}×{" "}
                                {(lang === "km"
                                  ? i.product_name_km || i.product_name
                                  : i.product_name || i.product_name_km) ||
                                  `#${i.product_id}`}
                              </span>
                              {i.variant && (
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60">
                                  {i.variant}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white font-mono text-base">
                      {formatPrice(o.total_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-50 transition-all shadow-2xs ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}
                      >
                        {STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="text-slate-900 dark:bg-[#181120] dark:text-white"
                          >
                            {t(`orderStatus.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(o.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
