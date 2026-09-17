import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BellRing, CalendarClock } from "lucide-react";
import { api } from "../api/client";
import AlertModal from "../components/AlertModal";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";

const TYPE_META = {
  info: { label: "Info", cls: "bg-blue-100 text-blue-700" },
  success: { label: "Success", cls: "bg-emerald-100 text-emerald-700" },
  warning: { label: "Warning", cls: "bg-amber-100 text-amber-700" },
  danger: { label: "Danger", cls: "bg-rose-100 text-rose-700" },
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

  // Real-time: Alert ផ្លាស់ប្តូរ -> បញ្ជីបច្ចុប្បន្នភាពភ្លាមៗ
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Alerts &amp; Popups
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Announcements shown to customers on the storefront (banner / popup).
            Updates appear instantly thanks to real-time WebSocket.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          New alert
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {alerts === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-10 text-center text-slate-400 text-sm">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 sm:p-14 text-center">
          <BellRing className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">No alerts yet</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first announcement — it will appear on the storefront immediately.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 font-semibold">Alert</th>
                <th className="px-4 py-3.5 font-semibold">Display</th>
                <th className="px-4 py-3.5 font-semibold">
                  <CalendarClock className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                  Schedule
                </th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {alerts.map((a) => {
                const t = TYPE_META[a.alert_type] || TYPE_META.info;
                const scheduled =
                  a.starts_at || a.expires_at
                    ? `${fmtDate(a.starts_at)} → ${fmtDate(a.expires_at)}`
                    : "Always";
                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${t.cls}`}
                        >
                          {t.label}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {a.title || "(untitled)"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {a.message || "No message"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {STYLE_LABEL[a.style] || a.style}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{scheduled}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(a)}
                        className={`relative w-11 h-6 rounded-full transition ${
                          a.is_active ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        aria-label={a.is_active ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                            a.is_active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(a);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirming(a)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          aria-label="Delete"
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
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">
            {confirming?.title || `alert #${confirming?.id}`}
          </strong>
          ? It will disappear from the storefront immediately.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

