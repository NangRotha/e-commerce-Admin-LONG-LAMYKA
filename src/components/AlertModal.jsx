import { useEffect, useRef, useState } from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link as LinkIcon,
  Upload,
  Loader2,
  Trash2,
  ImagePlus,
  BellRing,
} from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

const EMPTY = {
  title: "",
  message: "",
  alert_type: "info",
  style: "both",
  image_url: "",
  link_url: "",
  is_active: true,
  starts_at: "",
  expires_at: "",
};

const TYPES = [
  { value: "info", labelKey: "alerts.typeInfo", icon: Info, cls: "bg-blue-100 text-blue-700" },
  {
    value: "success",
    labelKey: "alerts.typeSuccess",
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "warning",
    labelKey: "alerts.typeWarning",
    icon: AlertTriangle,
    cls: "bg-amber-100 text-amber-700",
  },
  { value: "danger", labelKey: "alerts.typeDanger", icon: XCircle, cls: "bg-rose-100 text-rose-700" },
];

const STYLES = [
  { value: "banner", labelKey: "alerts.styleBannerLong" },
  { value: "popup", labelKey: "alerts.stylePopupLong" },
  { value: "both", labelKey: "alerts.styleBoth" },
];

// ISO -> value សម្រាប់ <input type="datetime-local"> (បង្ហាញជាម៉ោងក្នុងស្រុក)
function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local -> ISO (ផ្ញើទៅ Backend ជា UTC)
function fromDatetimeLocal(val) {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AlertModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title || "",
              message: initial.message || "",
              alert_type: initial.alert_type || "info",
              style: initial.style || "both",
              image_url: initial.image_url || "",
              link_url: initial.link_url || "",
              is_active: initial.is_active ?? true,
              starts_at: toDatetimeLocal(initial.starts_at),
              expires_at: toDatetimeLocal(initial.expires_at),
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Upload រូបភាពពីកុំព្យូទ័រ (Local PC)
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await api.uploadAlertImage(file);
      setForm((f) => ({ ...f, image_url: res.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() && !form.message.trim()) {
      setError(t("alerts.titleOrMessageRequired"));
      return;
    }
    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at) {
      setError(t("alerts.startBeforeEnd"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        message: form.message.trim(),
        alert_type: form.alert_type,
        style: form.style,
        image_url: form.image_url.trim(),
        link_url: form.link_url.trim(),
        is_active: form.is_active,
        starts_at: fromDatetimeLocal(form.starts_at),
        expires_at: fromDatetimeLocal(form.expires_at),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 text-sm placeholder:text-slate-400 transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t("alerts.editAlert") : t("alerts.newAlert")}
      subtitle={initial ? t("alerts.editSubtitle") : t("alerts.addSubtitle")}
      icon={BellRing}
      maxWidth="xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={label}>{t("alerts.alertTitle")}</label>
          <input
            className={input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={t("alerts.titlePlaceholder")}
          />
        </div>

        <div>
          <label className={label}>{t("alerts.alertMessage")}</label>
          <textarea
            className={`${input} resize-none`}
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={t("alerts.messagePlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("alerts.alertType")}</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {TYPES.map((tp) => (
                <button
                  key={tp.value}
                  type="button"
                  onClick={() => set("alert_type", tp.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                    form.alert_type === tp.value
                      ? "border-pink-500 ring-2 ring-pink-200 dark:ring-pink-900 " + tp.cls
                      : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                  }`}
                >
                  <tp.icon className="w-3.5 h-3.5" />
                  {t(tp.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>{t("alerts.alertStyle")}</label>
            <select
              className={input}
              value={form.style}
              onChange={(e) => set("style", e.target.value)}
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(s.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>{t("alerts.alertImageLabel")}</label>
          <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-60 shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? t("common.uploading") : t("alerts.uploadImage")}
            </button>
            <input
              className={input}
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder={t("alerts.pasteImageUrl")}
            />
          </div>
          {form.image_url && (
            <div className="relative mt-2">
              <img
                src={form.image_url}
                alt={t("alerts.imagePreviewAlt")}
                className="h-36 w-full object-cover rounded-xl border border-slate-200 bg-slate-100"
                onError={(e) => (e.target.style.display = "none")}
              />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition"
                aria-label={t("alerts.removeImage")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-900/60 text-white text-xs font-medium">
                <ImagePlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                {t("common.preview")}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className={label}>
            <LinkIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
            {t("alerts.alertLinkFull")}
          </label>
          <input
            className={input}
            value={form.link_url}
            onChange={(e) => set("link_url", e.target.value)}
            placeholder={t("alerts.linkPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("alerts.startsAtOptional")}</label>
            <input
              type="datetime-local"
              className={input}
              value={form.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>{t("alerts.expiresAtOptional")}</label>
            <input
              type="datetime-local"
              className={input}
              value={form.expires_at}
              onChange={(e) => set("expires_at", e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="w-4 h-4 rounded accent-pink-600"
          />
          {t("alerts.activeOnStorefront")}
        </label>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="pt-2 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition text-sm shadow-md shadow-pink-500/25 disabled:opacity-60 cursor-pointer"
          >
            {saving
              ? t("common.saving")
              : initial
              ? t("alerts.saveChanges")
              : t("alerts.addAlertShort")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

