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
  { value: "info", label: "Info", icon: Info, cls: "bg-blue-100 text-blue-700" },
  { value: "success", label: "Success", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
  { value: "warning", label: "Warning", icon: AlertTriangle, cls: "bg-amber-100 text-amber-700" },
  { value: "danger", label: "Danger", icon: XCircle, cls: "bg-rose-100 text-rose-700" },
];

const STYLES = [
  { value: "banner", label: "Banner (top strip)" },
  { value: "popup", label: "Popup (modal)" },
  { value: "both", label: "Banner + Popup" },
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
      setError("Please enter a title or message.");
      return;
    }
    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at) {
      setError("Start date must be earlier than end date.");
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
      title={initial ? "Edit Alert" : "New Alert"}
      subtitle={initial ? "Configure popup or banner announcement" : "Create a storefront announcement"}
      icon={BellRing}
      maxWidth="xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={label}>Title</label>
          <input
            className={input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Holiday Sale"
          />
        </div>

        <div>
          <label className={label}>Message</label>
          <textarea
            className={`${input} resize-none`}
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="e.g. Get 20% off everything this weekend with code SALE20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Type</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("alert_type", t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                    form.alert_type === t.value
                      ? "border-pink-500 ring-2 ring-pink-200 dark:ring-pink-900 " + t.cls
                      : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Display</label>
            <select
              className={input}
              value={form.style}
              onChange={(e) => set("style", e.target.value)}
            >
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Image (upload from your computer, or paste a URL)</label>
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
              {uploading ? "Uploading..." : "Upload image"}
            </button>
            <input
              className={input}
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="...or paste an image URL"
            />
          </div>
          {form.image_url && (
            <div className="relative mt-2">
              <img
                src={form.image_url}
                alt="Alert preview"
                className="h-36 w-full object-cover rounded-xl border border-slate-200 bg-slate-100"
                onError={(e) => (e.target.style.display = "none")}
              />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition"
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-900/60 text-white text-xs font-medium">
                <ImagePlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                Preview
              </span>
            </div>
          )}
        </div>

        <div>
          <label className={label}>
            <LinkIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
            Link when clicked (optional)
          </label>
          <input
            className={input}
            value={form.link_url}
            onChange={(e) => set("link_url", e.target.value)}
            placeholder="e.g. /products or https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Starts at (optional)</label>
            <input
              type="datetime-local"
              className={input}
              value={form.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Expires at (optional)</label>
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
          Active (show on storefront)
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition text-sm shadow-md shadow-pink-500/25 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Add alert"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

