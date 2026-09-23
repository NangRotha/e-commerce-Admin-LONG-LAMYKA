import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Tags, AlertCircle } from "lucide-react";
import { api } from "../api/client";
import CategoryModal from "../components/CategoryModal";
import Modal from "../components/Modal";
import { formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const { t } = useI18n();

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("categories.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {categories
                ? t("categories.subtitle", { count: categories.length })
                : t("categories.subtitleLoading")}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-95 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t("categories.addCategory")}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("categories.searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs"
        />
      </div>

      {categories === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400">
          <Tags className="w-12 h-12 mx-auto mb-3 text-pink-300 dark:text-pink-900/60" />
          <p className="font-bold">
            {categories.length === 0 ? t("categories.noCategories") : t("categories.noMatch")}
          </p>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">{t("categories.categoryName")}</th>
                <th className="px-4 py-4 font-bold">{t("categories.categoryDesc")}</th>
                <th className="px-4 py-4 font-bold">{t("categories.products")}</th>
                <th className="px-4 py-4 font-bold">{t("categories.createdDate")}</th>
                <th className="px-5 py-4 font-bold text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center text-pink-500 shrink-0 shadow-2xs">
                        <Tags className="w-4 h-4" />
                      </div>
                      <span className="text-base">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate text-xs sm:text-sm">
                    {c.description || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${
                        c.product_count > 0
                          ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/60 shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {t("categories.itemsCount", { count: c.product_count })}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 dark:hover:text-pink-400 transition"
                        title={t("categories.editCategory")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(c)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title={t("categories.deleteCategory")}
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

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={t("categories.deleteCategory")}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("categories.confirmDeleteFull", { name: confirming?.name })}
          </p>
          {confirming?.product_count > 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl p-3">
              {t("categories.hasProducts", { count: confirming.product_count })}
            </p>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setConfirming(null)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={confirming?.product_count > 0}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {t("common.delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
