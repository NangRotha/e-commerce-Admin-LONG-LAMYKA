import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TicketPercent } from "lucide-react";
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

  // Real-time: Discounts ត្រូវបានកែប្រែ -> ផ្ទុកឡើងវិញភ្លាមៗ
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
    "mt-1.5 w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center shrink-0">
              <TicketPercent className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            Discounts &amp; Promo Codes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {discounts ? `${discounts.length} promo codes` : "Loading..."}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 hover:shadow-md hover:shadow-pink-500/30 active:scale-[0.98] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Create promo
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      {discounts === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-pink-200 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400">
          No promo codes yet. Create one to start offering discounts.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-5 py-3.5 font-bold">Code</th>
                <th className="px-5 py-3.5 font-bold">Percent</th>
                <th className="px-5 py-3.5 font-bold">Uses</th>
                <th className="px-5 py-3.5 font-bold">Expiry</th>
                <th className="px-5 py-3.5 font-bold">Active</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-pink-50/20 dark:hover:bg-pink-950/10 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-pink-600 dark:text-pink-400">
                    <span className="px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200/60 dark:border-pink-900/50">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                    {d.percent}%
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {d.used_count}/{d.max_uses}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {d.expiry_date ? formatDate(d.expiry_date) : "Never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggle(d.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        d.is_active ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      aria-label={d.is_active ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          d.is_active ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
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
              ))}
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
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
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
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 active:scale-[0.98] transition-all text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
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
            <span className="font-mono font-bold text-pink-600">
              {confirmingDelete?.code}
            </span>
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
