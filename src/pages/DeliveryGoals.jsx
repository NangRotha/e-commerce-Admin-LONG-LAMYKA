import { useCallback, useEffect, useState } from "react";
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { api } from "../api/client";
import MilestoneModal from "../components/MilestoneModal";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";

export default function DeliveryGoals() {
  const [milestones, setMilestones] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Interactive slider for testing the live preview
  const [simulatedSubtotal, setSimulatedSubtotal] = useState(18);

  const load = useCallback(() => {
    api
      .getAdminMilestones()
      .then((data) => {
        setMilestones(data);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: Milestone បានកែប្រែ -> បច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("milestones_changed", load);

  const handleSave = async (payload) => {
    if (editing) {
      await api.updateMilestone(editing.id, payload);
    } else {
      await api.createMilestone(payload);
    }
    setEditing(null);
    await load();
  };

  const handleToggle = async (m) => {
    setTogglingId(m.id);
    try {
      await api.toggleMilestone(m.id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmingDelete) return;
    try {
      await api.deleteMilestone(confirmingDelete.id);
      setConfirmingDelete(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirmingDelete(null);
    }
  };

  // Find active milestone for preview
  const activeMilestones = (milestones || []).filter((m) => m.is_active);
  const primaryMilestone =
    activeMilestones.find((m) => m.threshold > simulatedSubtotal) ||
    activeMilestones[0] ||
    milestones?.[0];

  const previewThreshold = primaryMilestone ? primaryMilestone.threshold : 30;
  const previewRemaining = Math.max(0, previewThreshold - simulatedSubtotal);
  const previewPercent = Math.min(
    100,
    Math.round((simulatedSubtotal / previewThreshold) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            Delivery Goals &amp; Milestone Banners
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set order thresholds for Free Delivery and Gifts. Toggle Show/Hide and update progress banner in real time.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 hover:shadow-md hover:shadow-pink-500/30 active:scale-[0.98] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Live Interactive Preview Box (Matching user's screenshot exactly!) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A1220] border border-pink-200/80 dark:border-pink-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 dark:border-pink-950/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-pink-100">
                Live Storefront Preview (Cart Milestone Banner)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeMilestones.length === 0
                  ? "⚠️ All milestones are currently HIDDEN. Customers will NOT see the banner."
                  : "How your customers see the banner in their shopping cart right now."}
              </p>
            </div>
          </div>

          {/* Test cart subtotal simulator slider */}
          <div className="flex items-center gap-3 bg-pink-50/70 dark:bg-[#120D18] px-3.5 py-1.5 rounded-2xl border border-pink-200/60 dark:border-pink-900/50">
            <Sliders className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Test Cart Subtotal:{" "}
              <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                ${simulatedSubtotal.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min="0"
              max={Math.max(60, previewThreshold * 1.5)}
              step="1"
              value={simulatedSubtotal}
              onChange={(e) => setSimulatedSubtotal(parseFloat(e.target.value))}
              className="w-24 sm:w-32 accent-pink-500 cursor-pointer"
            />
          </div>
        </div>

        {/* The Exact Component from Screenshot */}
        {activeMilestones.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-pink-200 dark:border-pink-950 text-slate-400 dark:text-slate-500 text-sm">
            🙈 Banner is completely hidden from storefront because all milestones are switched OFF.
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#1A1220]/90 border border-pink-200/70 dark:border-pink-900/50 shadow-md">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2.5">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-pink-100">
                {previewRemaining > 0 ? (
                  <>
                    <span className="text-base">{primaryMilestone?.icon || "🎁"}</span>
                    <span>
                      Add{" "}
                      <span className="text-pink-600 dark:text-pink-400 font-extrabold">
                        ${previewRemaining.toFixed(2)}
                      </span>{" "}
                      more for {primaryMilestone?.title || "Free Sweet Delivery & Gift!"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base">{primaryMilestone?.unlocked_icon || "🎉"}</span>
                    <span className="text-pink-600 dark:text-pink-300">
                      {primaryMilestone?.reward_text || "Yay! You unlocked Free Sweet Delivery & Gift! 🎁✨"}
                    </span>
                  </>
                )}
              </span>
              <span className="text-xs font-black text-pink-500">{previewPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-pink-100/70 dark:bg-[#130D18] rounded-full overflow-hidden p-0.5 border border-pink-200/50 dark:border-pink-950">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${previewPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestones List */}
      {milestones === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : milestones.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-pink-200 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="text-4xl">🎁</div>
          <p className="font-bold">No delivery milestones created yet.</p>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-5 py-2 rounded-2xl bg-pink-500 text-white text-xs font-bold shadow-sm"
          >
            Create First Milestone
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Configured Milestones ({milestones.length})
            </span>
            <span className="text-xs text-slate-500">
              {activeMilestones.length} active (showing)
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pink-50/10 dark:hover:bg-pink-950/10 transition"
              >
                {/* Left: Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center text-2xl shrink-0">
                    {m.icon || "🎁"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {m.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/50">
                        ${m.threshold.toFixed(2)}
                      </span>
                      {m.show_on_cart && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Cart Page
                        </span>
                      )}
                      {m.show_on_top && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                          Top Bar
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>Reward text:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {m.unlocked_icon} {m.reward_text}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions & Hide/Show Switch */}
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                  {/* Hide & Show Toggle Button */}
                  <button
                    onClick={() => handleToggle(m)}
                    disabled={togglingId === m.id}
                    title={m.is_active ? "Click to Hide banner" : "Click to Show banner"}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      m.is_active
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {m.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Showing</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditing(m);
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/50 transition"
                    title="Edit milestone"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmingDelete(m)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Create / Edit */}
      <MilestoneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        milestone={editing}
      />

      {/* Modal Confirm Delete */}
      <Modal
        open={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        title="Delete Milestone"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              "{confirmingDelete?.title}" (${confirmingDelete?.threshold})
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setConfirmingDelete(null)}
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
