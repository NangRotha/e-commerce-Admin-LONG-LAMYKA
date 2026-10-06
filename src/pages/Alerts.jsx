import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BellRing, CalendarClock, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import AlertModal from "../components/AlertModal";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const TYPE_META = {
  info: { labelKey: "alerts.typeInfo", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60" },
  success: { labelKey: "alerts.typeSuccess", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60" },
  warning: { labelKey: "alerts.typeWarning", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60" },
  danger: { labelKey: "alerts.typeDanger", cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60" },
};

const STYLE_LABEL = {
  banner: "alerts.styleBanner",
  popup: "alerts.stylePopup",
  both: "alerts.styleBoth",
};

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const { t, lang } = useI18n();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(
    () =>
      api
        .getAlerts()
        .then(setAlerts)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("alerts_changed", load);

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await api.updateAlert(editing.id, payload);
        showToast(t("alerts.updatedSuccess") || "Alert updated successfully!");
      } else {
        await api.createAlert(payload);
        showToast(t("alerts.savedSuccess") || "Alert created successfully!");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteAlert(confirming.id);
      showToast(t("alerts.deletedSuccess") || "Alert deleted successfully!");
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirming(null);
    }
  };

  const toggleActive = async (a) => {
    try {
      await api.updateAlert(a.id, { ...a, is_active: !a.is_active });
      showToast(
        !a.is_active
          ? "Alert is now live on storefront"
          : "Alert hidden from storefront"
      );
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("alerts.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("alerts.subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-95 transition-all text-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t("alerts.newAlert")}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {alerts === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="luxury-card rounded-[28px] p-12 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center shadow-inner">
            <BellRing className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t("alerts.noAlertsTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {t("alerts.noAlertsDesc")}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t("alerts.newAlert")}</span>
          </button>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">{t("alerts.thMessage")}</th>
                <th className="px-4 py-4 font-bold">{t("alerts.alertStyle")}</th>
                <th className="px-4 py-4 font-bold">
                  <CalendarClock className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-pink-500" />
                  {t("alerts.thSchedule")}
                </th>
                <th className="px-4 py-4 font-bold">{t("alerts.thStatus")}</th>
                <th className="px-5 py-4 font-bold text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {alerts.map((a) => {
                const meta = TYPE_META[a.alert_type] || TYPE_META.info;
                const scheduled =
                  a.starts_at || a.expires_at
                    ? `${fmtDate(a.starts_at)} → ${fmtDate(a.expires_at)}`
                    : t("alerts.alwaysActive");

                const mainTitle = lang === "km" ? (a.title_km || a.title) : (a.title || a.title_km);
                const subTitle = lang === "km" ? (a.title && a.title !== a.title_km ? a.title : "") : (a.title_km && a.title_km !== a.title ? a.title_km : "");
                const mainMsg = lang === "km" ? (a.message_km || a.message) : (a.message || a.message_km);

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <span
                            className={`mt-0.5 shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-2xs ${meta.cls}`}
                          >
                            {t(meta.labelKey)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {mainTitle || t("common.untitled")}
                          </p>
                          {subTitle && (
                            <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium truncate">
                              {subTitle}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {mainMsg || t("alerts.noMessage")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700">
                        {STYLE_LABEL[a.style] ? t(STYLE_LABEL[a.style]) : a.style}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {scheduled}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(a)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          a.is_active ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                        aria-label={a.is_active ? t("common.disable") : t("common.enable")}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            a.is_active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(a);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 dark:hover:text-pink-400 transition cursor-pointer"
                          title={t("alerts.editAlert")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirming(a)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title={t("alerts.deleteAlert")}
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
        </div>
      )}

      <AlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={t("alerts.deleteAlert")}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("alerts.confirmDelete")}{" "}
            <strong className="text-slate-900 dark:text-white">
              {confirming?.title || confirming?.title_km || `#${confirming?.id}`}
            </strong>{" "}
            {t("alerts.confirmDeleteDesc")}
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setConfirming(null)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
            >
              {t("common.delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
