import { useCallback, useEffect, useState } from "react";
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
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

  // Real-time updates
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
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Delivery Goals &amp; Milestone Banners
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Set order thresholds for Free Delivery and Gifts. Toggle Show/Hide and update progress banner in real time.
              </p>
            </div>
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
          <span>New Goal</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Storefront Simulator Card */}
      <div className="luxury-card rounded-[28px] p-5 sm:p-7 space-y-5">
        {/* Simulator Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-pink-100/70 dark:border-pink-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/70 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center text-pink-500 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-pink-50">
                  Live Storefront Preview (Cart Milestone Banner)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/60">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeMilestones.length === 0
                  ? "⚠️ All milestones are currently HIDDEN. Customers will NOT see the banner."
                  : "Drag the slider to test how customers experience progress in real time."}
              </p>
            </div>
          </div>

          {/* Test cart subtotal simulator controls */}
          <div className="flex flex-wrap items-center gap-2.5 bg-pink-50/60 dark:bg-[#120a17] p-2 sm:px-4 sm:py-2 rounded-2xl border border-pink-100 dark:border-pink-950/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cart:
              </span>
              <span className="font-mono font-black text-pink-600 dark:text-pink-400 text-sm px-2 py-0.5 rounded-lg bg-white dark:bg-black/30 border border-pink-200/50 dark:border-pink-900/50 shadow-2xs">
                ${simulatedSubtotal.toFixed(2)}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max={Math.max(60, Math.ceil(previewThreshold * 1.5))}
              step="1"
              value={simulatedSubtotal}
              onChange={(e) => setSimulatedSubtotal(parseFloat(e.target.value))}
              className="w-24 sm:w-36 accent-pink-500 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {[0, 15, 30].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSimulatedSubtotal(val)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    simulatedSubtotal === val
                      ? "bg-pink-500 text-white shadow-2xs"
                      : "bg-white dark:bg-[#1e1526] text-slate-600 dark:text-slate-300 hover:text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Simulated Storefront Banner */}
        {activeMilestones.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-pink-200 dark:border-pink-950/80 text-slate-400 dark:text-slate-500 text-sm">
            🙈 Banner is completely hidden from storefront because all milestones are switched OFF.
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-pink-50/50 via-white to-rose-50/50 dark:from-[#1b1122] dark:via-[#160d1d] dark:to-[#1a1021] border border-pink-200/80 dark:border-pink-800/40 shadow-sm relative overflow-hidden">
            {/* Ambient subtle glow inside simulator */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-3">
              <span className="flex items-center gap-2 text-slate-900 dark:text-pink-100 flex-wrap">
                {previewRemaining > 0 ? (
                  <>
                    <span className="text-xl animate-bounce">{primaryMilestone?.icon || "🎁"}</span>
                    <span>
                      Add{" "}
                      <span className="text-pink-600 dark:text-pink-400 font-extrabold text-sm sm:text-base">
                        ${previewRemaining.toFixed(2)}
                      </span>{" "}
                      more for {primaryMilestone?.title || "Free Sweet Delivery & Gift!"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl animate-bounce">{primaryMilestone?.unlocked_icon || "🎉"}</span>
                    <span className="text-pink-600 dark:text-pink-300 font-black">
                      {primaryMilestone?.reward_text || "Yay! You unlocked Free Sweet Delivery & Gift! 🎁✨"}
                    </span>
                  </>
                )}
              </span>
              <span className="text-xs sm:text-sm font-black text-pink-600 dark:text-pink-400 font-mono px-2.5 py-1 rounded-xl bg-pink-100/70 dark:bg-pink-950/70 border border-pink-200/60 dark:border-pink-800/60">
                {previewPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-pink-100/70 dark:bg-[#100916] rounded-full overflow-hidden p-0.5 border border-pink-200/60 dark:border-pink-950">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${previewPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestones List */}
      {milestones === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : milestones.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 dark:bg-pink-950/60 text-pink-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
            🎁
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No delivery milestones created yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create your first order threshold to motivate customers to spend more!
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:shadow-lg transition-all"
          >
            Create First Milestone
          </button>
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden">
          {/* Header Row */}
          <div className="px-6 py-4 border-b border-pink-100/70 dark:border-pink-950/70 flex items-center justify-between bg-pink-50/30 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-pink-200/70">
                Configured Milestones ({milestones.length})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {activeMilestones.length} active (showing)
              </span>
            </div>
          </div>

          {/* Cards List */}
          <div className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-all duration-200"
              >
                {/* Left: Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100/60 dark:from-pink-950/60 dark:to-purple-950/60 border border-pink-200/60 dark:border-pink-800/50 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                    {m.icon || "🎁"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                        {m.title}
                      </h3>
                      <span className="px-3 py-0.5 rounded-full text-xs font-black font-mono bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/60 shadow-2xs">
                        ${m.threshold.toFixed(2)}
                      </span>
                      {m.show_on_cart && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          Cart Page
                        </span>
                      )}
                      {m.show_on_top && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60">
                          Top Bar
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-400 dark:text-slate-500">Reward text:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        {m.unlocked_icon} {m.reward_text}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions & Hide/Show Switch */}
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                  {/* Hide & Show Toggle Button */}
                  <button
                    onClick={() => handleToggle(m)}
                    disabled={togglingId === m.id}
                    title={m.is_active ? "Click to Hide banner" : "Click to Show banner"}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                      m.is_active
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
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
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 border border-transparent hover:border-pink-200 dark:hover:border-pink-900/60 transition"
                    title="Edit milestone"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmingDelete(m)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition"
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
