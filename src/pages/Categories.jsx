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

  // Real-time: Category ផ្លាស់ប្តូរ
  useRealtime("products_changed", load);
  useRealtime("categories_changed", load);


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
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 hover:shadow-md hover:shadow-pink-500/30 active:scale-[0.98] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs"
        />
      </div>

      {categories === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-pink-200 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400">
          <Tags className="w-10 h-10 mx-auto mb-3 text-pink-300 dark:text-pink-900/60" />
          {categories.length === 0
            ? "No categories yet. Add one to organize your products."
            : "No categories match your search."}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-5 py-3.5 font-bold">Name</th>
                <th className="px-5 py-3.5 font-bold">Description</th>
                <th className="px-5 py-3.5 font-bold">Products</th>
                <th className="px-5 py-3.5 font-bold">Created</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-pink-50/20 dark:hover:bg-pink-950/10 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center shrink-0">
                        <Tags className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {c.description || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.product_count > 0
                          ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/50"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {c.product_count}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 dark:hover:text-pink-400 transition"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(c)}
                        className="p-2 rounded-xl text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
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
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900 dark:text-white">{confirming?.name}</strong>? This
          action cannot be undone.
        </p>
        {confirming?.product_count > 0 && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
            This category has {confirming.product_count} product(s). You must
            reassign or delete them before you can remove this category.
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirming?.product_count > 0}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm shadow-rose-600/25 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

