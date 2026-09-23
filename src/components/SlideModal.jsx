import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, Clapperboard, MonitorPlay, Link as LinkIcon, GalleryHorizontal } from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

const EMPTY = {
  title: "",
  subtitle: "",
  media_type: "image",
  media_url: "",
  youtube_url: "",
  link_url: "",
  sort_order: 0,
  is_active: true,
};

export function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

const MEDIA_TYPES = [
  { value: "image", labelKey: "slides.typeImage", icon: ImageIcon },
  { value: "video", labelKey: "slides.typeVideo", icon: Clapperboard },
  { value: "youtube", labelKey: "slides.typeYoutube", icon: MonitorPlay },
];

export default function SlideModal({ open, onClose, onSave, initial }) {
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
              subtitle: initial.subtitle || "",
              media_type: initial.media_type || "image",
              media_url: initial.media_url || "",
              youtube_url: initial.youtube_url || "",
              link_url: initial.link_url || "",
              sort_order: initial.sort_order ?? 0,
              is_active: initial.is_active ?? true,
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await api.uploadSlideMedia(file);
      // បើ Upload វីដេអូ -> ប្តូរទៅ media_type 'video' ដោយស្វ័យប្រវត្តិ
      setForm((f) => ({
        ...f,
        media_url: res.url,
        media_type: res.media_type === "video" ? "video" : f.media_type,
      }));
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
    if (form.media_type === "youtube") {
      if (!getYouTubeId(form.youtube_url.trim())) {
        setError(t("slides.invalidYoutube"));
        return;
      }
    } else if (!form.media_url.trim()) {
      setError(t("slides.mediaRequired"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        media_type: form.media_type,
        media_url: form.media_url.trim(),
        youtube_url: form.media_type === "youtube" ? form.youtube_url.trim() : "",
        link_url: form.link_url.trim(),
        sort_order: parseInt(form.sort_order, 10) || 0,
        is_active: form.is_active,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 text-sm transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const ytId = form.media_type === "youtube" ? getYouTubeId(form.youtube_url) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t("slides.editSlide") : t("slides.addSlide")}
      subtitle={initial ? t("slides.editSubtitle") : t("slides.addSubtitle")}
      icon={GalleryHorizontal}
      maxWidth="xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div>
          <label className={label}>{t("slides.mediaTypeLabel")}</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {MEDIA_TYPES.map((mt) => (
              <button
                key={mt.value}
                type="button"
                onClick={() => set("media_type", mt.value)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                  form.media_type === mt.value
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500 font-semibold"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-pink-400 dark:hover:border-pink-500"
                }`}
              >
                <mt.icon className="w-4 h-4" />
                {t(mt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {form.media_type === "youtube" ? (
          <div>
            <label className={label}>{t("slides.youtubeUrl")}</label>
            <input
              className={input}
              value={form.youtube_url}
              onChange={(e) => set("youtube_url", e.target.value)}
              placeholder={t("slides.youtubePlaceholder")}
            />
            {ytId ? (
              <img
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt={t("slides.youtubePreviewAlt")}
                className="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                {t("slides.thumbnailHint")}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className={label}>
              {form.media_type === "image" ? t("slides.imageUploadLabel") : t("slides.videoUploadLabel")}
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept={
                  form.media_type === "image"
                    ? "image/*"
                    : "video/*,.mp4,.webm,.mov,.ogg,.m4v"
                }
                onChange={handleUpload}
                className="hidden"
                id="slide-media-file"
              />
              <label
                htmlFor="slide-media-file"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("common.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {form.media_type === "image" ? t("slides.uploadImage") : t("slides.uploadVideo")}
                  </>
                )}
              </label>
            </div>

            <label className={`${label} mt-3`}>
              {form.media_type === "image" ? t("slides.pasteImageUrl") : t("slides.pasteVideoUrl")}
            </label>
            <input
              className={input}
              value={form.media_url}
              onChange={(e) => set("media_url", e.target.value)}
              placeholder={
                form.media_type === "image"
                  ? t("slides.imageUrlPlaceholder")
                  : t("slides.videoUrlPlaceholder")
              }
            />

            {form.media_url && (
              <div className="mt-2">
                {form.media_type === "image" ? (
                  <img
                    src={form.media_url}
                    alt={t("slides.slidePreviewAlt")}
                    className="h-32 w-full object-cover rounded-xl border border-slate-200"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <video
                    src={form.media_url}
                    controls
                    muted
                    className="h-32 w-full object-cover rounded-xl border border-slate-200 bg-slate-100"
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("common.title")}</label>
            <input
              className={input}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("slides.titlePlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("slides.subtitleField")}</label>
            <input
              className={input}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder={t("slides.subtitlePlaceholder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>
              <LinkIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              {t("slides.linkWhenClicked")}
            </label>
            <input
              className={input}
              value={form.link_url}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder={t("slides.linkPlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("slides.sortOrder")}</label>
            <input
              type="number"
              className={input}
              value={form.sort_order}
              onChange={(e) => set("sort_order", e.target.value)}
              placeholder={t("slides.sortOrderPlaceholder")}
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
          {t("slides.activeStorefront")}
        </label>

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
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition text-sm shadow-md shadow-pink-500/25 disabled:opacity-60 cursor-pointer"
          >
            {saving
              ? t("common.saving")
              : initial
              ? t("slides.saveChanges")
              : t("slides.addSlideShort")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

