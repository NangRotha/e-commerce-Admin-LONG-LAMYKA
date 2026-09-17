import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, Clapperboard, MonitorPlay, Link as LinkIcon, GalleryHorizontal } from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";

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
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Clapperboard },
  { value: "youtube", label: "YouTube", icon: MonitorPlay },
];

export default function SlideModal({ open, onClose, onSave, initial }) {
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
        setError("Please enter a valid YouTube URL.");
        return;
      }
    } else if (!form.media_url.trim()) {
      setError("Please upload a file or paste a media URL.");
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
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const ytId = form.media_type === "youtube" ? getYouTubeId(form.youtube_url) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Slide" : "Add Slide"}
      subtitle={initial ? "Update banner slider item" : "Create a new slide for the storefront hero"}
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
          <label className={label}>Media type *</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {MEDIA_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("media_type", t.value)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                  form.media_type === t.value
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {form.media_type === "youtube" ? (
          <div>
            <label className={label}>YouTube URL *</label>
            <input
              className={input}
              value={form.youtube_url}
              onChange={(e) => set("youtube_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {ytId ? (
              <img
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt="YouTube preview"
                className="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                Thumbnail preview will appear here.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className={label}>
              {form.media_type === "image" ? "Image" : "Video"} (upload from computer)
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {form.media_type === "image" ? "Upload image" : "Upload video"}
                  </>
                )}
              </label>
            </div>

            <label className={`${label} mt-3`}>
              Or paste {form.media_type === "image" ? "image" : "video"} URL
            </label>
            <input
              className={input}
              value={form.media_url}
              onChange={(e) => set("media_url", e.target.value)}
              placeholder={
                form.media_type === "image"
                  ? "https://example.com/banner.jpg"
                  : "https://example.com/video.mp4"
              }
            />

            {form.media_url && (
              <div className="mt-2">
                {form.media_type === "image" ? (
                  <img
                    src={form.media_url}
                    alt="Slide preview"
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
            <label className={label}>Title</label>
            <input
              className={input}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Summer Sale"
            />
          </div>
          <div>
            <label className={label}>Subtitle</label>
            <input
              className={input}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="e.g. Up to 50% off"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>
              <LinkIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              Link when clicked
            </label>
            <input
              className={input}
              value={form.link_url}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder="e.g. /products or https://..."
            />
          </div>
          <div>
            <label className={label}>Sort order</label>
            <input
              type="number"
              className={input}
              value={form.sort_order}
              onChange={(e) => set("sort_order", e.target.value)}
              placeholder="0 = first"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-600"
          />
          Active (show on storefront)
        </label>

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
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition text-sm shadow-md shadow-emerald-900/20 disabled:opacity-60"
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Add slide"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

