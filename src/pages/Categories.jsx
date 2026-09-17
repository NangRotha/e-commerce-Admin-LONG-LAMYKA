import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Tags } from "lucide-react";
import { api } from "../api/client";
import CategoryModal from "../components/CategoryModal";
import Modal from "../components/Modal";
import { formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(
    () =>
      api
        .getCategories()
        .then(setCategories)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: Category ផ្លាស់ប្តូរ (Backend ប្រកាស products_changed)
  useRealtime("products_changed", load);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (categories || []).filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleSave = async (payload) => {
    if (editing) await api.updateCategory(editing.id, payload);
    else await api.createCategory(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    try {
      await api.deleteCategory(confirming.id);
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {categories ? `${categories.length} categories` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
        />
      </div>

      {categories === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center text-slate-500 dark:text-slate-400">
          <Tags className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          {categories.length === 0
            ? "No categories yet. Add one to organize your products."
            : "No categories match your search."}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <Tags className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {c.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {c.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        c.product_count > 0
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {c.product_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(c)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        aria-label="Delete"
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


      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Delete category">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">{confirming?.name}</strong>? This
          action cannot be undone.
        </p>
        {confirming?.product_count > 0 && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            This category has {confirming.product_count} product(s). You must
            reassign or delete them before you can remove this category.
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirming?.product_count > 0}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

