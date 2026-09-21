import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TicketPercent, Copy, Check, Calendar, AlertCircle } from "lucide-react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";

export default function Discounts() {
  const [discounts, setDiscounts] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    percent: "",
    max_uses: 100,
    expiry_date: "",
    is_active: true,
  });

  const load = useCallback(() => {
    api
      .getDiscounts()
      .then(setDiscounts)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("discounts_changed", load);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", percent: "", max_uses: 100, expiry_date: "", is_active: true });
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      code: d.code,
      percent: String(d.percent),
      max_uses: d.max_uses,
      expiry_date: d.expiry_date ? d.expiry_date.slice(0, 16) : "",
      is_active: d.is_active,
    });
    setModalOpen(true);
  };

  const copyCode = (d) => {
    navigator.clipboard?.writeText(d.code);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim() || !form.percent) {
      setError("Code and percent are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.updateDiscount(editing.id, {
          code: form.code.trim().toUpperCase(),
          percent: parseFloat(form.percent),
          max_uses: parseInt(form.max_uses, 10) || 100,
          expiry_date: form.expiry_date || null,
          is_active: form.is_active,
        });
      } else {
        await api.createDiscount({
          code: form.code.trim().toUpperCase(),
          percent: parseFloat(form.percent),
          max_uses: parseInt(form.max_uses, 10) || 100,
          expiry_date: form.expiry_date || null,
        });
      }
      setModalOpen(false);
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

  const handleDelete = async () => {
    if (!confirmingDelete) return;
    try {
      await api.deleteDiscount(confirmingDelete.id);
      setConfirmingDelete(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirmingDelete(null);
    }
  };

  const input =
    "mt-1.5 w-full px-4 py-2.5 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs";
  const label = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-pink-200/70";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <TicketPercent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Discounts &amp; Promo Codes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {discounts ? `${discounts.length} promo codes active in store` : "Loading discounts..."}
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-95 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Promo</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {discounts === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="text-4xl">🏷️</div>
          <p className="font-bold">No promo codes yet. Create one to start offering discounts.</p>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">Code</th>
                <th className="px-4 py-4 font-bold">Discount</th>
                <th className="px-4 py-4 font-bold">Usage Progress</th>
                <th className="px-4 py-4 font-bold">Expiry Date</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {discounts.map((d) => {
                const isExpired = d.expiry_date && new Date(d.expiry_date) < new Date();
                const usagePct = Math.min(100, Math.round(((d.used_count || 0) / (d.max_uses || 1)) * 100));
                return (
                  <tr
                    key={d.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/70 border border-pink-200/70 dark:border-pink-900/60 shadow-2xs font-mono font-black text-pink-600 dark:text-pink-400 text-sm">
                        <span>{d.code}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(d)}
                          title="Copy promo code"
                          className="p-1 rounded-md text-slate-400 hover:text-pink-600 dark:hover:text-white transition"
                        >
                          {copiedId === d.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60">
                        {d.percent}% OFF
                      </span>
                    </td>

                    <td className="px-4 py-4 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span>{d.used_count} used</span>
                          <span className="text-slate-400">of {d.max_uses}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {d.expiry_date ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(d.expiry_date)}</span>
                          {isExpired && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Never expires</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggle(d.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          d.is_active ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                        aria-label={d.is_active ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            d.is_active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition"
                          title="Edit Promo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(d)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Promo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit promo code" : "Create promo code"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Promo Code *</label>
              <input
                className={input}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className={label}>Discount (%) *</label>
              <input
                type="number"
                min="1"
                max="100"
                className={input}
                value={form.percent}
                onChange={(e) => setForm({ ...form, percent: e.target.value })}
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Max Uses</label>
              <input
                type="number"
                min="1"
                className={input}
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Expiry Date (optional)</label>
              <input
                type="datetime-local"
                className={input}
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_check"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 accent-pink-600"
            />
            <label htmlFor="is_active_check" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Active immediately
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-pink-100 dark:border-pink-950/70">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-bold shadow-md shadow-pink-500/25 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update Promo" : "Create Promo"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        title="Delete Promo Code"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete promo code{" "}
            <strong className="text-slate-900 dark:text-white font-mono">
              "{confirmingDelete?.code}"
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setConfirmingDelete(null)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
