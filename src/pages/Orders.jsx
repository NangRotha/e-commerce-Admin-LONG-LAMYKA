import { useEffect, useState } from "react";
import { api } from "../api/client";
import { formatPrice, formatDate } from "../lib/format";

const STATUSES = ["pending", "paid", "shipped", "cancelled"];

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () =>
    api
      .getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

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
        <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">
          {orders ? `${orders.length} orders` : "Loading..."}
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {orders === null ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No orders yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    #{o.id}
                    {o.promo_code && (
                      <span className="ml-2 text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                        {o.promo_code}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{o.user_email || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-600">
                      {o.items.length === 0 ? (
                        "—"
                      ) : (
                        <span>
                          {o.items
                            .map((i) => `${i.quantity}× #${i.product_id}`)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
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
                        <option key={s} value={s} className="text-slate-800">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
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
