import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { formatDate } from "../lib/format";

export default function Discounts() {
  const [discounts, setDiscounts] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    percent: "",
    max_uses: 100,
    expiry_date: "",
  });

  const load = () =>
    api
      .getDiscounts()
      .then(setDiscounts)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim() || !form.percent) {
      setError("Code and percent are required.");
      return;
    }
    setSaving(true);
    try {
      await api.createDiscount({
        code: form.code.trim().toUpperCase(),
        percent: parseFloat(form.percent),
        max_uses: parseInt(form.max_uses, 10) || 100,
        expiry_date: form.expiry_date || null,
      });
      setModalOpen(false);
      setForm({ code: "", percent: "", max_uses: 100, expiry_date: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    try {
      await api.toggleDiscount(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition";
  const label = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Discounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {discounts ? `${discounts.length} promo codes` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create promo
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {discounts === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center text-slate-500 dark:text-slate-400">
          No promo codes yet. Create one to start offering discounts.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 font-semibold">Code</th>
                <th className="px-4 py-3.5 font-semibold">Percent</th>
                <th className="px-4 py-3.5 font-semibold">Uses</th>
                <th className="px-4 py-3.5 font-semibold">Expiry</th>
                <th className="px-4 py-3.5 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                    {d.percent}%
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {d.used_count}/{d.max_uses}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {d.expiry_date ? formatDate(d.expiry_date) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(d.id)}
                      className={`relative w-11 h-6 rounded-full transition ${
                        d.is_active ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      aria-label={d.is_active ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                          d.is_active ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create promo code"
      >
        <form onSubmit={create} className="space-y-4">
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Code *</label>
              <input
                className={input}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                maxLength={20}
              />
            </div>
            <div>
              <label className={label}>Percent (%) *</label>
              <input
                type="number"
                min="1"
                max="100"
                className={input}
                value={form.percent}
                onChange={(e) => setForm({ ...form, percent: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Max uses</label>
              <input
                type="number"
                min="1"
                className={input}
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Expiry date</label>
              <input
                type="datetime-local"
                className={input}
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
