import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Clapperboard,
  MonitorPlay,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { api } from "../api/client";
import SlideModal, { getYouTubeId } from "../components/SlideModal";
import Modal from "../components/Modal";

const TYPE_META = {
  image: { label: "Image", icon: ImageIcon, cls: "bg-blue-100 text-blue-700" },
  video: { label: "Video", icon: Clapperboard, cls: "bg-violet-100 text-violet-700" },
  youtube: { label: "YouTube", icon: MonitorPlay, cls: "bg-rose-100 text-rose-700" },
};

function SlidePreview({ slide }) {
  if (slide.media_type === "youtube") {
    const id = getYouTubeId(slide.youtube_url);
    return id ? (
      <img
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt={slide.title || "slide"}
        className="h-20 w-32 object-cover rounded-lg border border-slate-200"
      />
    ) : (
      <div className="h-20 w-32 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
        <MonitorPlay className="w-6 h-6" />
      </div>
    );
  }
  if (slide.media_type === "video") {
    return (
      <video
        src={slide.media_url}
        muted
        className="h-20 w-32 object-cover rounded-lg border border-slate-200 bg-slate-100"
      />
    );
  }
  return slide.media_url ? (
    <img
      src={slide.media_url}
      alt={slide.title || "slide"}
      className="h-20 w-32 object-cover rounded-lg border border-slate-200 bg-slate-100"
      onError={(e) => (e.target.style.display = "none")}
    />
  ) : (
    <div className="h-20 w-32 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
      <ImageIcon className="w-6 h-6" />
    </div>
  );
}

export default function Slides() {
  const [slides, setSlides] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = () =>
    api
      .getSlides()
      .then(setSlides)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

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
    // ប្តូរ sort_order រវាង Slide ទាំងពីរ (មិនកែ State ដោយផ្ទាល់)
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Slides</h1>
          <p className="text-sm text-slate-500">
            {slides ? `${slides.length} slides` : "Loading..."} — banner shown on
            the storefront homepage
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {slides === null ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          <Clapperboard className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          No slides yet. Add images, videos or YouTube links to promote your
          store on the homepage.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Preview</th>
                <th className="px-4 py-3 font-semibold">Slide</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((s, idx) => {
                const meta = TYPE_META[s.media_type] || TYPE_META.image;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <SlidePreview slide={s} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {s.title || "—"}
                      </div>
                      {s.subtitle && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {s.subtitle}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.cls}`}
                      >
                        <meta.icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-600">{s.sort_order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => move(s.id, -1)}
                            disabled={idx === 0}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => move(s.id, 1)}
                            disabled={idx === slides.length - 1}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`relative w-11 h-6 rounded-full transition ${
                          s.is_active ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        aria-label={s.is_active ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                            s.is_active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirming(s)}
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


      <SlideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Delete slide">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">
            {confirming?.title || `slide #${confirming?.id}`}
          </strong>
          ? This action cannot be undone.
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

