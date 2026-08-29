import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { formatPrice } from "../lib/format";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

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
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Store overview & performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-6 h-6" />} label="Total Products" value={stats.total_products} accent="emerald" />
        <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={stats.total_users} accent="blue" />
        <StatCard icon={<ShoppingCart className="w-6 h-6" />} label="Total Orders" value={stats.total_orders} accent="amber" />
        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Revenue (paid)" value={formatPrice(stats.total_revenue)} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Recent Orders</h2>
          {stats.recent_orders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recent_orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      #{o.id} · {o.user_email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}
                    >
                      {o.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(o.total_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Low Stock
          </h2>
          {stats.low_stock.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              All products are well stocked. 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {p.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      p.stock === 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-bold text-slate-900 mt-6 mb-3">Orders by Status</h2>
          <div className="space-y-1.5">
            {Object.keys(stats.orders_by_status).length === 0 && (
              <p className="text-sm text-slate-400">No orders.</p>
            )}
            {Object.entries(stats.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-slate-600 capitalize">{status}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
