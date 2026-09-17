import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { formatPrice, formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const STATUSES = ["pending", "paid", "shipped", "cancelled"];

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function Orders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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

  // Real-time: មាន Order ថ្មី ឬការបង់ប្រាក់ជោគជ័យ -> បញ្ជីបច្ចុប្បន្នភាពភ្លាមៗ
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t("orders.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {orders ? t("orders.count", { count: orders.length }) : t("common.loading")}
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {orders === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400">
          {t("orders.noOrders")}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">{t("orders.order")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.customer")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.shipping")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.items")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.total")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.date")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    #{o.id}
                    {o.promo_code && (
                      <span className="ml-2 text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 px-2 py-0.5 rounded-full">
                        {o.promo_code}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-100 font-medium">
                      {o.customer_name || "—"}
                    </div>
                    {o.customer_phone && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {o.customer_phone}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      {o.user_email || o.customer_email || (
                        <span className="font-semibold text-violet-700 dark:text-violet-400">
                          {t("orders.guest")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {o.shipping_address ? (
                      <span
                        className="block max-w-[220px] line-clamp-2"
                        title={o.shipping_address}
                      >
                        {o.shipping_address}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                    {o.note && (
                      <span
                        className="mt-1 block max-w-[220px] text-xs text-amber-700 dark:text-amber-400 line-clamp-2"
                        title={`Note: ${o.note}`}
                      >
                        📝 {o.note}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {o.items.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <div className="space-y-1">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="flex items-center flex-wrap gap-1 text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {i.quantity}× {i.product_name || `#${i.product_id}`}
                            </span>
                            {i.variant && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {i.variant}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {formatPrice(o.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="text-slate-800 dark:bg-slate-800 dark:text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(o.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
