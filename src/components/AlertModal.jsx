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
  Sparkles,
  Eye,
  Edit3,
  Gift,
  Truck,
  Megaphone,
  X,
  ExternalLink,
  Calendar,
  RotateCcw,
} from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { AutoTranslateBar, FieldTranslateButton } from "./AutoTranslateAction";

const EMPTY = {
  title: "",
  title_km: "",
  message: "",
  message_km: "",
  alert_type: "info",
  style: "both",
  image_url: "",
  link_url: "",
  is_active: true,
  starts_at: "",
  expires_at: "",
};

const TYPES = [
  {
    value: "info",
    labelKey: "alerts.typeInfo",
    icon: Info,
    activeCls: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400 ring-2 ring-blue-500/20",
    badgeCls: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    value: "success",
    labelKey: "alerts.typeSuccess",
    icon: CheckCircle2,
    activeCls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400 ring-2 ring-emerald-500/20",
    badgeCls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    value: "warning",
    labelKey: "alerts.typeWarning",
    icon: AlertTriangle,
    activeCls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400 ring-2 ring-amber-500/20",
    badgeCls: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    value: "danger",
    labelKey: "alerts.typeDanger",
    icon: XCircle,
    activeCls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400 ring-2 ring-rose-500/20",
    badgeCls: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
];

const STYLES = [
  { value: "banner", labelKey: "alerts.styleBannerLong" },
  { value: "popup", labelKey: "alerts.stylePopupLong" },
  { value: "both", labelKey: "alerts.styleBoth" },
];

const TEMPLATES = [
  {
    id: "promo",
    icon: Gift,
    labelKey: "alerts.templatePromo",
    data: {
      title: "🎉 Special Promo – 50% Off Today!",
      title_km: "🎉 ប្រូម៉ូសិនពិសេស – បញ្ចុះតម្លៃ ៥០% ថ្ងៃនេះ!",
      message: "Enjoy 50% off on your favorite picks! Limited time offer only. Shop now and save big! 🛍️",
      message_km: "ទទួលបានការបញ្ចុះតម្លៃ ៥០% លើគ្រប់ទំនិញពេញនិយម! ការផ្តល់ជូនមានកំណត់ សូមកុំឲ្យឱកាសកន្លងផុត! 🛍️",
      alert_type: "success",
      style: "both",
      link_url: "/",
    },
  },
  {
    id: "delivery",
    icon: Truck,
    labelKey: "alerts.templateDelivery",
    data: {
      title: "🚚 Free Nationwide Delivery on Orders Over $20!",
      title_km: "🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំងប្រទេស រាល់ការកុម្ម៉ង់ចាប់ពី $20!",
      message: "Order today and receive fast delivery straight to your doorstep with zero shipping fees.",
      message_km: "កុម្ម៉ង់ទិញថ្ងៃនេះ ដើម្បីទទួលបានការដឹកជញ្ជូនឆាប់រហ័សដល់មាត់ទ្វារផ្ទះដោយឥតគិតថ្លៃសេវាដឹក។",
      alert_type: "info",
      style: "banner",
      link_url: "/",
    },
  },
  {
    id: "new_arrival",
    icon: Sparkles,
    labelKey: "alerts.templateNewArrival",
    data: {
      title: "✨ Cute New Collections Have Arrived!",
      title_km: "✨ ម៉ូដថ្មីស្អាតៗទើបតែមកដល់ហាងហើយ!",
      message: "Check out our newest accessories and beauty picks crafted with love just for you.",
      message_km: "មកទស្សនាការប្រមូលផ្ដុំគ្រឿងតុបតែង និងផលិតផលថែរក្សាសម្រស់ម៉ូដថ្មីៗដែលរៀបចំឡើងដោយក្តីស្រលាញ់។",
      alert_type: "info",
      style: "popup",
      link_url: "/",
    },
  },
  {
    id: "notice",
    icon: Megaphone,
    labelKey: "alerts.templateNotice",
    data: {
      title: "📢 Holiday Store Notice",
      title_km: "📢 សេចក្តីជូនដំណឹងអំពីថ្ងៃឈប់សម្រាក",
      message: "Orders placed during the holiday will be processed promptly on our next opening day. Thank you!",
      message_km: "រាល់ការកុម្ម៉ង់ក្នុងឱកាសបុណ្យ នឹងត្រូវរៀបចំផ្ញើជូនភ្លាមៗនៅថ្ងៃបើកដំណើរការឡើងវិញ។ សូមអរគុណ!",
      alert_type: "warning",
      style: "both",
      link_url: "",
    },
  },
];

// ISO -> datetime-local
function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local -> ISO
function fromDatetimeLocal(val) {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AlertModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [fieldTranslating, setFieldTranslating] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"
  const [previewLang, setPreviewLang] = useState("km"); // "km" | "en"
  const fileRef = useRef(null);

  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title || "",
              title_km: initial.title_km || "",
              message: initial.message || "",
              message_km: initial.message_km || "",
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
      setActiveTab("form");
      setFieldTranslating({});
      setTranslating(false);
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Apply Quick Template
  const applyTemplate = (tpl) => {
    setForm((prev) => ({
      ...prev,
      ...tpl.data,
    }));
  };

  // AI Translate All (EN -> KM or KM -> EN)
  const handleTranslateAll = async (direction = "en_to_km") => {
    setError("");
    const isEnToKm = direction === "en_to_km";
    const srcLang = isEnToKm ? "en" : "km";
    const tgtLang = isEnToKm ? "km" : "en";

    const fieldsToTranslate = {};
    if (isEnToKm) {
      if (form.title.trim()) fieldsToTranslate.title = form.title.trim();
      if (form.message.trim()) fieldsToTranslate.message = form.message.trim();
    } else {
      if (form.title_km.trim()) fieldsToTranslate.title_km = form.title_km.trim();
      if (form.message_km.trim()) fieldsToTranslate.message_km = form.message_km.trim();
    }

    if (Object.keys(fieldsToTranslate).length === 0) {
      setError(
        isEnToKm
          ? "Please type English Title or Message first"
          : "សូមវាយចំណងជើង ឬសារជាភាសាខ្មែរជាមុនសិន"
      );
      return;
    }

    setTranslating(true);
    try {
      const res = await api.translate({
        fields: fieldsToTranslate,
        source_lang: srcLang,
        target_lang: tgtLang,
      });

      if (res?.translated_fields) {
        setForm((prev) => ({
          ...prev,
          title: isEnToKm
            ? prev.title
            : (res.translated_fields.title_km || res.translated_fields.title || prev.title),
          title_km: isEnToKm
            ? (res.translated_fields.title || res.translated_fields.title_km || prev.title_km)
            : prev.title_km,
          message: isEnToKm
            ? prev.message
            : (res.translated_fields.message_km || res.translated_fields.message || prev.message),
          message_km: isEnToKm
            ? (res.translated_fields.message || res.translated_fields.message_km || prev.message_km)
            : prev.message_km,
        }));
      }
    } catch (err) {
      setError(err.message || "Failed to auto-translate with Gemini AI");
    } finally {
      setTranslating(false);
    }
  };

  // Single Field AI Translate
  const handleTranslateSingleField = async (sourceField, targetField, srcLang, tgtLang) => {
    const text = form[sourceField]?.trim();
    if (!text) return;
    setFieldTranslating((prev) => ({ ...prev, [targetField]: true }));
    setError("");
    try {
      const res = await api.translate({
        text,
        source_lang: srcLang,
        target_lang: tgtLang,
      });
      if (res?.translated_text) {
        setForm((prev) => ({ ...prev, [targetField]: res.translated_text }));
      }
    } catch (err) {
      setError(err.message || "Failed to translate field");
    } finally {
      setFieldTranslating((prev) => ({ ...prev, [targetField]: false }));
    }
  };

  // Upload image from Local PC
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

    const hasTitle = form.title.trim() || form.title_km.trim();
    const hasMessage = form.message.trim() || form.message_km.trim();

    if (!hasTitle && !hasMessage) {
      setError(t("alerts.titleOrMessageRequired"));
      return;
    }
    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at) {
      setError(t("alerts.startBeforeEnd"));
      return;
    }

    // Ensure fallback so English and Khmer are never blank if one is filled
    const finalTitle = form.title.trim() || form.title_km.trim();
    const finalTitleKm = form.title_km.trim() || form.title.trim();
    const finalMessage = form.message.trim() || form.message_km.trim();
    const finalMessageKm = form.message_km.trim() || form.message.trim();

    setSaving(true);
    try {
      await onSave({
        title: finalTitle,
        title_km: finalTitleKm,
        message: finalMessage,
        message_km: finalMessageKm,
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

  // Preview data helpers
  const displayTitle = previewLang === "km"
    ? (form.title_km || form.title || "🎉 ចំណងជើងការជូនដំណឹង")
    : (form.title || form.title_km || "🎉 Announcement Title");

  const displayMessage = previewLang === "km"
    ? (form.message_km || form.message || "អត្ថបទសារលម្អិតអំពីការបញ្ចុះតម្លៃ ឬការជូនដំណឹងផ្សេងៗ...")
    : (form.message || form.message_km || "Details message about promotion or store announcement...");

  const inputCls =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 text-sm placeholder:text-slate-400 transition";
  const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t("alerts.editAlert") : t("alerts.newAlert")}
      subtitle={initial ? t("alerts.editSubtitle") : t("alerts.addSubtitle")}
      icon={BellRing}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Navigation Tabs: Form vs Live Preview */}
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "form"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t("alerts.formTab")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t("alerts.previewTab")}</span>
            </button>
          </div>

          {activeTab === "preview" && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewLang("km")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  previewLang === "km"
                    ? "bg-pink-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                🇰🇭 ខ្មែរ
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  previewLang === "en"
                    ? "bg-pink-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          )}
        </div>

        {/* ===================== TAB 1: FORM ===================== */}
        {activeTab === "form" && (
          <form onSubmit={submit} className="space-y-4">
            {/* Quick Templates Strip */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>{t("alerts.templates")}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-pink-50/60 dark:bg-pink-950/30 hover:bg-pink-100/70 dark:hover:bg-pink-900/40 border border-pink-200/60 dark:border-pink-800/40 transition-all text-left group cursor-pointer active:scale-95"
                  >
                    <tpl.icon className="w-4 h-4 text-pink-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{t(tpl.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Auto-Translate Bar */}
            <AutoTranslateBar
              onTranslateAll={handleTranslateAll}
              isTranslating={translating}
              statusText="Translate Titles & Messages between Khmer and English"
            />

            {/* Bilingual Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    🇬🇧 {t("alerts.alertTitleEn")}
                  </label>
                  <FieldTranslateButton
                    onClick={() =>
                      handleTranslateSingleField("title_km", "title", "km", "en")
                    }
                    loading={fieldTranslating["title"]}
                    label="KM ➔ EN"
                    title="Translate Khmer Title to English"
                  />
                </div>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. 🎉 Special Weekend Promo – 50% Off"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    🇰🇭 {t("alerts.alertTitleKm")}
                  </label>
                  <FieldTranslateButton
                    onClick={() =>
                      handleTranslateSingleField("title", "title_km", "en", "km")
                    }
                    loading={fieldTranslating["title_km"]}
                    label="EN ➔ ខ្មែរ"
                    title="Translate English Title to Khmer"
                  />
                </div>
                <input
                  className={inputCls}
                  value={form.title_km}
                  onChange={(e) => set("title_km", e.target.value)}
                  placeholder="ឧ. 🎉 ប្រូម៉ូសិនពិសេស – បញ្ចុះតម្លៃ ៥០%"
                />
              </div>
            </div>

            {/* Bilingual Messages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    🇬🇧 {t("alerts.alertMessageEn")}
                  </label>
                  <FieldTranslateButton
                    onClick={() =>
                      handleTranslateSingleField("message_km", "message", "km", "en")
                    }
                    loading={fieldTranslating["message"]}
                    label="KM ➔ EN"
                    title="Translate Khmer Message to English"
                  />
                </div>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="e.g. Shop now and save 50% on all new arrivals! Limited time offer."
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    🇰🇭 {t("alerts.alertMessageKm")}
                  </label>
                  <FieldTranslateButton
                    onClick={() =>
                      handleTranslateSingleField("message", "message_km", "en", "km")
                    }
                    loading={fieldTranslating["message_km"]}
                    label="EN ➔ ខ្មែរ"
                    title="Translate English Message to Khmer"
                  />
                </div>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.message_km}
                  onChange={(e) => set("message_km", e.target.value)}
                  placeholder="ឧ. ទទួលបានការបញ្ចុះតម្លៃ ៥០% លើគ្រប់ទំនិញថ្មីៗ! ការផ្តល់ជូនមានកំណត់។"
                />
              </div>
            </div>

            {/* Alert Type & Display Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("alerts.alertType")}</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {TYPES.map((tp) => (
                    <button
                      key={tp.value}
                      type="button"
                      onClick={() => set("alert_type", tp.value)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        form.alert_type === tp.value
                          ? tp.activeCls
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <tp.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t(tp.labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>{t("alerts.alertStyle")}</label>
                <select
                  className={`${inputCls} mt-1.5`}
                  value={form.style}
                  onChange={(e) => set("style", e.target.value)}
                >
                  {STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {t(s.labelKey)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  {form.style === "banner" && "បង្ហាញតែរបារពណ៌នៅក្រោម Navbar"}
                  {form.style === "popup" && "បង្ហាញតែប្រអប់ផ្ទាំង Modal នៅចំកណ្តាលអេក្រង់"}
                  {form.style === "both" && "បង្ហាញទាំងរបារបដា និងប្រអប់ផ្ទាំង Modal"}
                </p>
              </div>
            </div>

            {/* Image (Upload or URL) */}
            <div>
              <label className={labelCls}>{t("alerts.alertImageLabel")}</label>
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
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition disabled:opacity-60 shrink-0 cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                  ) : (
                    <Upload className="w-4 h-4 text-pink-500" />
                  )}
                  {uploading ? t("common.uploading") : t("alerts.uploadImage")}
                </button>
                <input
                  className={inputCls}
                  value={form.image_url}
                  onChange={(e) => set("image_url", e.target.value)}
                  placeholder={t("alerts.pasteImageUrl")}
                />
              </div>

              {form.image_url && (
                <div className="relative mt-2.5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={form.image_url}
                    alt={t("alerts.imagePreviewAlt")}
                    className="h-36 w-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <button
                    type="button"
                    onClick={() => set("image_url", "")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition cursor-pointer"
                    aria-label={t("alerts.removeImage")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-xs text-white text-xs font-semibold">
                    <ImagePlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-pink-400" />
                    {t("common.preview")}
                  </span>
                </div>
              )}
            </div>

            {/* Click URL Link */}
            <div>
              <label className={labelCls}>
                <LinkIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-pink-500" />
                {t("alerts.alertLinkFull")}
              </label>
              <input
                className={inputCls}
                value={form.link_url}
                onChange={(e) => set("link_url", e.target.value)}
                placeholder={t("alerts.linkPlaceholder")}
              />
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <Calendar className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-pink-500" />
                  {t("alerts.startsAtOptional")}
                </label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.starts_at}
                  onChange={(e) => set("starts_at", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <Calendar className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-rose-500" />
                  {t("alerts.expiresAtOptional")}
                </label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.expires_at}
                  onChange={(e) => set("expires_at", e.target.value)}
                />
              </div>
            </div>

            {(form.starts_at || form.expires_at) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    set("starts_at", "");
                    set("expires_at", "");
                  }}
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t("alerts.clearSchedule")}</span>
                </button>
              </div>
            )}

            {/* Active on Storefront Checkbox */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/40 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                className="w-4 h-4 rounded accent-pink-600 cursor-pointer"
              />
              <span>{t("alerts.activeOnStorefront")}</span>
            </label>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold transition text-sm shadow-md shadow-pink-500/25 disabled:opacity-60 cursor-pointer active:scale-95"
              >
                {saving
                  ? t("common.saving")
                  : initial
                  ? t("alerts.saveChanges")
                  : t("alerts.addAlertShort")}
              </button>
            </div>
          </form>
        )}

        {/* ===================== TAB 2: LIVE PREVIEW ===================== */}
        {activeTab === "preview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Banner Preview */}
            {(form.style === "banner" || form.style === "both") && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{t("alerts.previewBanner")}</span>
                </div>

                <div className="rounded-2xl border border-pink-200/80 dark:border-pink-900/50 overflow-hidden shadow-xs">
                  <div
                    className={`relative flex items-center gap-3 px-4 sm:px-6 py-3 text-sm ${
                      form.alert_type === "success"
                        ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                        : form.alert_type === "warning"
                        ? "bg-amber-50 text-amber-900 border-b border-amber-200"
                        : form.alert_type === "danger"
                        ? "bg-rose-50 text-rose-900 border-b border-rose-200"
                        : "bg-blue-50 text-blue-900 border-b border-blue-200"
                    }`}
                  >
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt=""
                        className="shrink-0 w-9 h-9 rounded-lg object-cover border border-black/5"
                      />
                    ) : (
                      <span className="text-xl shrink-0">
                        {form.alert_type === "success"
                          ? "🎉"
                          : form.alert_type === "warning"
                          ? "⚠️"
                          : form.alert_type === "danger"
                          ? "🚨"
                          : "📢"}
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <strong className="font-extrabold mr-1.5">{displayTitle}</strong>
                      <span className="opacity-90">{displayMessage}</span>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Popup Preview */}
            {(form.style === "popup" || form.style === "both") && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{t("alerts.previewPopup")}</span>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xs p-6 rounded-3xl flex items-center justify-center border border-slate-700/50">
                  <div className="relative bg-white dark:bg-[#1a1222] border border-pink-200/80 dark:border-pink-900/50 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden">
                    {/* Close button preview */}
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs">
                      ✕
                    </div>

                    {/* Image */}
                    {form.image_url && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={form.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center text-xs font-bold">
                          {form.alert_type === "success"
                            ? "🎉"
                            : form.alert_type === "warning"
                            ? "⚠️"
                            : form.alert_type === "danger"
                            ? "🚨"
                            : "📢"}
                        </span>
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                          Store Announcement
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {displayTitle}
                      </h4>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {displayMessage}
                      </p>

                      <div className="mt-5 flex gap-2 justify-end">
                        {form.link_url && (
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-xs">
                            {previewLang === "km" ? "ស្វែងយល់បន្ថែម" : "Learn more"}
                          </div>
                        )}
                        <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                          {previewLang === "km" ? "យល់ព្រម" : "Got it"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {t("alerts.formTab")}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
