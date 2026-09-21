import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BellRing, CalendarClock, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../api/client";
import AlertModal from "../components/AlertModal";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";

const TYPE_META = {
  info: { label: "Info", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60" },
  success: { label: "Success", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60" },
  warning: { label: "Warning", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60" },
  danger: { label: "Danger", cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60" },
};

const STYLE_LABEL = { banner: "Banner", popup: "Popup", both: "Banner + Popup" };

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

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
    if (editing) await api.updateAlert(editing.id, payload);
    else await api.createAlert(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    try {
      await api.deleteAlert(confirming.id);
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
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Alerts &amp; Popups
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Broadcast announcements, top banners, and modal popups to customers in real time.
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
          <span>New Alert</span>
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
        <div className="luxury-card rounded-[28px] p-12 sm:p-16 text-center space-y-3">
          <BellRing className="w-14 h-14 mx-auto text-pink-300 dark:text-pink-900/60" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">No alerts yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Create your first announcement — it will appear on the storefront immediately.
          </p>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">Alert Message</th>
                <th className="px-4 py-4 font-bold">Display Style</th>
                <th className="px-4 py-4 font-bold">
                  <CalendarClock className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-pink-500" />
                  Schedule
                </th>
                <th className="px-4 py-4 font-bold">Live Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {alerts.map((a) => {
                const meta = TYPE_META[a.alert_type] || TYPE_META.info;
                const scheduled =
                  a.starts_at || a.expires_at
                    ? `${fmtDate(a.starts_at)} → ${fmtDate(a.expires_at)}`
                    : "Always Active";
                return (
                  <tr
                    key={a.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-2xs ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {a.title || "(untitled)"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {a.message || "No message"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700">
                        {STYLE_LABEL[a.style] || a.style}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {scheduled}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(a)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          a.is_active ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                        aria-label={a.is_active ? "Deactivate" : "Activate"}
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
                          className="p-2 rounded-xl text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 dark:hover:text-pink-400 transition"
                          title="Edit Alert"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirming(a)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Delete Alert"
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

      <AlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Delete alert">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 dark:text-white">
              {confirming?.title || `alert #${confirming?.id}`}
            </strong>
            ? It will disappear from the storefront immediately.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setConfirming(null)}
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
