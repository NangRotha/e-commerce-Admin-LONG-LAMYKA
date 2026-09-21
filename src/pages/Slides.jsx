import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Clapperboard,
  MonitorPlay,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  GalleryHorizontal,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/client";
import SlideModal, { getYouTubeId } from "../components/SlideModal";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";

const TYPE_META = {
  image: { label: "Image", icon: ImageIcon, cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60" },
  video: { label: "Video", icon: Clapperboard, cls: "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60" },
  youtube: { label: "YouTube", icon: MonitorPlay, cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60" },
};

function SlidePreview({ slide }) {
  if (slide.media_type === "youtube") {
    const id = getYouTubeId(slide.youtube_url);
    return id ? (
      <img
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt={slide.title || "slide"}
        className="h-18 w-28 object-cover rounded-xl border border-pink-100 dark:border-pink-950/60 shadow-2xs"
      />
    ) : (
      <div className="h-18 w-28 rounded-xl border border-pink-100 dark:border-pink-950/60 bg-pink-50/50 dark:bg-[#181120] flex items-center justify-center text-pink-400">
        <MonitorPlay className="w-5 h-5" />
      </div>
    );
  }
  if (slide.media_type === "video") {
    return (
      <video
        src={slide.media_url}
        muted
        className="h-18 w-28 object-cover rounded-xl border border-pink-100 dark:border-pink-950/60 bg-pink-50/50 dark:bg-[#181120] shadow-2xs"
      />
    );
  }
  return slide.media_url ? (
    <img
      src={slide.media_url}
      alt={slide.title || "slide"}
      className="h-18 w-28 object-cover rounded-xl border border-pink-100 dark:border-pink-950/60 bg-pink-50/50 dark:bg-[#181120] shadow-2xs"
      onError={(e) => (e.target.style.display = "none")}
    />
  ) : (
    <div className="h-18 w-28 rounded-xl border border-pink-100 dark:border-pink-950/60 bg-pink-50/50 dark:bg-[#181120] flex items-center justify-center text-pink-400">
      <ImageIcon className="w-5 h-5" />
    </div>
  );
}

export default function Slides() {
  const [slides, setSlides] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(
    () =>
      api
        .getSlides()
        .then(setSlides)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("slides_changed", load);

  const handleSave = async (payload) => {
    if (editing) await api.updateSlide(editing.id, payload);
    else await api.createSlide(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    try {
      await api.deleteSlide(confirming.id);
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirming(null);
    }
  };

  const move = async (id, dir) => {
    const list = [...slides];
    const idx = list.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= list.length) return;
    const a = list[idx];
    const b = list[swap];
    const aNew = { ...a, sort_order: b.sort_order };
    const bNew = { ...b, sort_order: a.sort_order };
    try {
      await api.updateSlide(a.id, aNew);
      await api.updateSlide(b.id, bNew);
      await load();
    } catch (e) {
      setError(e.message);
      await load();
    }
  };

  const toggleActive = async (s) => {
    try {
      await api.updateSlide(s.id, { ...s, is_active: !s.is_active });
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
            <GalleryHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hero Slides &amp; Banners
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {slides ? `${slides.length} slides configured` : "Loading slides..."} — featured banners on storefront homepage
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
          <span>Add Slide</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {slides === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Clapperboard className="w-12 h-12 mx-auto mb-2 text-pink-300 dark:text-pink-900/60" />
          <p className="font-bold">
            No slides yet. Add images, videos or YouTube links to promote your store on the homepage.
          </p>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">Preview</th>
                <th className="px-4 py-4 font-bold">Slide Details</th>
                <th className="px-4 py-4 font-bold">Media Type</th>
                <th className="px-4 py-4 font-bold">Display Order</th>
                <th className="px-4 py-4 font-bold">Live Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {slides.map((s, idx) => {
                const meta = TYPE_META[s.media_type] || TYPE_META.image;
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <SlidePreview slide={s} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white text-base">
                        {s.title || "(Untitled)"}
                      </div>
                      {s.subtitle && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                          {s.subtitle}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${meta.cls}`}
                      >
                        <meta.icon className="w-3.5 h-3.5" />
                        <span>{meta.label}</span>
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700 dark:text-slate-200 font-bold px-2 py-0.5 rounded-lg bg-pink-50/50 dark:bg-pink-950/50 border border-pink-200/50 dark:border-pink-900/40">
                          {s.sort_order}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => move(s.id, -1)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 disabled:opacity-30 transition rounded-md hover:bg-pink-50 dark:hover:bg-pink-950/50"
                            title="Move up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => move(s.id, 1)}
                            disabled={idx === slides.length - 1}
                            className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 disabled:opacity-30 transition rounded-md hover:bg-pink-50 dark:hover:bg-pink-950/50"
                            title="Move down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          s.is_active ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                        aria-label={s.is_active ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            s.is_active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 dark:hover:text-pink-400 transition"
                          title="Edit Slide"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirming(s)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Delete Slide"
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

      <SlideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Delete slide">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this slide? This action cannot be undone.
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
