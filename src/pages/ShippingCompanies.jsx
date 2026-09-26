import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Truck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { formatDate } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

export default function ShippingCompanies() {
  const [companies, setCompanies] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_km: "",
    fee: "1.50",
    estimated_delivery: "1-2 days",
    sort_order: 0,
    is_active: true,
  });

  const { t, lang } = useI18n();

  const load = useCallback(() => {
    return api
      .getAdminShippingCompanies()
      .then((data) => {
        setCompanies(data);
        setError("");
      })
      .catch((e) => setError(e.message || "Failed to load shipping companies"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("shipping_companies_changed", load);

  const openAddModal = () => {
    setEditing(null);
    setFormData({
      name: "",
      name_km: "",
      fee: "1.50",
      estimated_delivery: "1-2 days",
      sort_order: companies ? companies.length : 0,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditing(c);
    setFormData({
      name: c.name || "",
      name_km: c.name_km || "",
      fee: c.fee !== undefined ? String(c.fee) : "1.50",
      estimated_delivery: c.estimated_delivery || "",
      sort_order: c.sort_order || 0,
      is_active: c.is_active !== undefined ? c.is_active : true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.name_km.trim()) {
      setError("Please provide a company name in English or Khmer");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: formData.name.trim() || formData.name_km.trim(),
        name_km: formData.name_km.trim() || formData.name.trim(),
        fee: parseFloat(formData.fee) || 0.0,
        estimated_delivery: formData.estimated_delivery.trim(),
        sort_order: parseInt(formData.sort_order, 10) || 0,
        is_active: formData.is_active,
      };

      if (editing) {
        await api.updateShippingCompany(editing.id, payload);
        setSuccess(t("shippingCompanies.updatedSuccess"));
      } else {
        await api.createShippingCompany(payload);
        setSuccess(t("shippingCompanies.createdSuccess"));
      }
      setModalOpen(false);
      await load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save company");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await api.toggleShippingCompany(c.id);
      await load();
    } catch (err) {
      setError(err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!confirming) return;
    try {
      await api.deleteShippingCompany(confirming.id);
      setConfirming(null);
      setSuccess(t("shippingCompanies.deletedSuccess"));
      await load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete company");
      setConfirming(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (companies || []).filter(
      (c) =>
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.name_km || "").toLowerCase().includes(q) ||
        (c.estimated_delivery || "").toLowerCase().includes(q)
    );
  }, [companies, search]);

  const displayName = (c) =>
    lang === "km" ? c.name_km || c.name : c.name || c.name_km;
  const secondaryName = (c) =>
    lang === "km" ? c.name : c.name_km;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("shippingCompanies.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("shippingCompanies.subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-95 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t("shippingCompanies.addCompany")}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("products.searchPlaceholder") || "Search companies..."}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-indigo-100/80 dark:border-indigo-950/70 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition shadow-2xs"
        />
      </div>

      {/* Data Table */}
      {companies === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400">
          <Truck className="w-12 h-12 mx-auto mb-3 text-indigo-300 dark:text-indigo-900/60" />
          <p className="font-bold">{t("shippingCompanies.noCompanies")}</p>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs border border-indigo-100/60 dark:border-indigo-950/60">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-indigo-300/60 border-b border-indigo-100/70 dark:border-indigo-950/70 bg-indigo-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">{t("shippingCompanies.name")}</th>
                <th className="px-4 py-4 font-bold">{t("shippingCompanies.fee")}</th>
                <th className="px-4 py-4 font-bold">{t("shippingCompanies.estimatedDelivery")}</th>
                <th className="px-4 py-4 font-bold text-center">{t("shippingCompanies.status")}</th>
                <th className="px-5 py-4 font-bold text-right">{t("shippingCompanies.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100/60 dark:divide-indigo-950/60">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-500 shrink-0 shadow-2xs font-bold text-xs">
                        🚚
                      </div>
                      <div>
                        <div className="font-bold text-base text-slate-900 dark:text-white">
                          {displayName(c)}
                        </div>
                        {secondaryName(c) && secondaryName(c) !== displayName(c) && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {secondaryName(c)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      ${Number(c.fee || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    {c.estimated_delivery || "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                        c.is_active
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                      title={c.is_active ? "Click to deactivate" : "Click to activate"}
                    >
                      {c.is_active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t("shippingCompanies.active")}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t("shippingCompanies.inactive")}</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        title={t("shippingCompanies.editCompany")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(c)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title={t("shippingCompanies.deleteCompany")}
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

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? t("shippingCompanies.editCompany")
            : t("shippingCompanies.addCompany")
        }
        icon={Truck}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t("shippingCompanies.name")} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. VET Express, J&T Express"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1325] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t("shippingCompanies.nameKm")} *
            </label>
            <input
              type="text"
              required
              value={formData.name_km}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name_km: e.target.value }))
              }
              placeholder="ឧ. វីរៈ ប៊ុនថាំ (VET Express), ជេ & ធី"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1325] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t("shippingCompanies.fee")} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.fee}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fee: e.target.value }))
                }
                placeholder="1.50"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1325] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t("shippingCompanies.sortOrder")}
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sort_order: e.target.value,
                  }))
                }
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1325] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t("shippingCompanies.estimatedDelivery")}
            </label>
            <input
              type="text"
              value={formData.estimated_delivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimated_delivery: e.target.value,
                }))
              }
              placeholder={t("shippingCompanies.estimatedDeliveryPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1325] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active_toggle"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label
              htmlFor="is_active_toggle"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {t("shippingCompanies.active")}
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition"
            >
              {t("shippingCompanies.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : t("shippingCompanies.save")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {confirming && (
        <Modal
          open={Boolean(confirming)}
          onClose={() => setConfirming(null)}
          title={t("shippingCompanies.deleteCompany")}
          icon={Trash2}
          maxWidth="sm"
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("shippingCompanies.confirmDelete")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              "{displayName(confirming)}" ({secondaryName(confirming)})
            </p>
            <p className="text-xs text-rose-500 font-medium">
              {t("shippingCompanies.confirmDeleteDesc")}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition"
              >
                {t("shippingCompanies.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/25 transition"
              >
                {t("shippingCompanies.deleteCompany")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
