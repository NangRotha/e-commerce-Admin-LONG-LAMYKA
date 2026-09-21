import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import Modal from "./Modal";

export default function CategoryModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || "",
        description: initial?.description || "",
      });
      setError("");
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 text-sm transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Category" : "Add Category"}
      subtitle={initial ? "Update category information" : "Create a new category for products"}
      icon={Tags}
      maxWidth="md"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div>
          <label className={label}>Name *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Electronics"
            maxLength={60}
            autoFocus
          />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea
            className={input}
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description (optional)"
          />
        </div>

        <div className="pt-3 flex gap-3 justify-end border-t border-pink-100 dark:border-pink-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-md shadow-pink-500/25 transition text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
