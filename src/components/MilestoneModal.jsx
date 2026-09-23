import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

const EMOJI_SUGGESTIONS = ["🎁", "🌸", "🎀", "🚚", "✨", "💖", "🛍️", "🏷️"];
const UNLOCKED_SUGGESTIONS = ["🎉", "👑", "🥳", "💫", "💖", "✨", "🎁", "🛍️"];

export default function MilestoneModal({ open, onClose, onSave, milestone }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("Free Sweet Delivery & Gift!");
  const [threshold, setThreshold] = useState("30");
  const [rewardText, setRewardText] = useState("Yay! You unlocked Free Sweet Delivery & Gift! 🎁✨");
  const [icon, setIcon] = useState("🎁");
  const [unlockedIcon, setUnlockedIcon] = useState("🎉");
  const [showOnCart, setShowOnCart] = useState(true);
  const [showOnTop, setShowOnTop] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Preview state (simulate preview at 60% progress)
  const [previewUnlocked, setPreviewUnlocked] = useState(false);

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title || "");
      setThreshold(String(milestone.threshold ?? 30));
      setRewardText(milestone.reward_text || "");
      setIcon(milestone.icon || "🎁");
      setUnlockedIcon(milestone.unlocked_icon || "🎉");
      setShowOnCart(milestone.show_on_cart !== false);
      setShowOnTop(!!milestone.show_on_top);
      setIsActive(milestone.is_active !== false);
      setSortOrder(milestone.sort_order ?? 0);
    } else {
      setTitle(t("deliveryGoals.defaultTitle"));
      setThreshold("30");
      setRewardText(t("deliveryGoals.defaultReward"));
      setIcon("🎁");
      setUnlockedIcon("🎉");
      setShowOnCart(true);
      setShowOnTop(false);
      setIsActive(true);
      setSortOrder(0);
    }
    setError("");
    setPreviewUnlocked(false);
  }, [milestone, open, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numThreshold = parseFloat(threshold);
    if (isNaN(numThreshold) || numThreshold <= 0) {
      setError(t("deliveryGoals.invalidThreshold"));
      return;
    }
    if (!title.trim()) {
      setError(t("deliveryGoals.titleRequired"));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        threshold: numThreshold,
        reward_text: rewardText.trim(),
        icon: icon.trim() || "🎁",
        unlocked_icon: unlockedIcon.trim() || "🎉",
        show_on_cart: showOnCart,
        show_on_top: showOnTop,
        is_active: isActive,
        sort_order: parseInt(sortOrder, 10) || 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || t("deliveryGoals.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const parsedThreshold = Math.max(1, parseFloat(threshold) || 30);
  const simulatedSubtotal = previewUnlocked ? parsedThreshold : Math.round(parsedThreshold * 0.6 * 100) / 100;
  const simulatedRemaining = Math.max(0, parsedThreshold - simulatedSubtotal);
  const simulatedProgress = Math.min(100, Math.round((simulatedSubtotal / parsedThreshold) * 100));

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={milestone ? t("deliveryGoals.editMilestoneTitle") : t("deliveryGoals.newMilestoneTitle")}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl">
            {error}
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-4 rounded-3xl bg-pink-50/60 dark:bg-[#1A1220] border border-pink-200/80 dark:border-pink-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
              <Sparkles className="w-3.5 h-3.5" />
              {t("deliveryGoals.livePreview")}
            </span>
            <button
              type="button"
              onClick={() => setPreviewUnlocked(!previewUnlocked)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900 hover:bg-pink-100 dark:hover:bg-pink-950 transition text-slate-700 dark:text-pink-200"
            >
              {t("deliveryGoals.simulate")}{" "}
              {previewUnlocked
                ? t("deliveryGoals.simulateUnlocked")
                : t("deliveryGoals.simulateInProgress")}
            </button>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#120D18] border border-pink-200/70 dark:border-pink-900/50 shadow-sm">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-pink-100">
                {simulatedRemaining > 0 ? (
                  <>
                    <span>{icon || "🎁"}</span>
                    <span>
                      {t("deliveryGoals.addPrefix")}{" "}
                      <span className="text-pink-600 dark:text-pink-400 font-extrabold">
                        ${simulatedRemaining.toFixed(2)}
                      </span>{" "}
                      {t("deliveryGoals.addSuffix", {
                        title: title || t("deliveryGoals.defaultTitle"),
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{unlockedIcon || "🎉"}</span>
                    <span className="text-pink-600 dark:text-pink-300">
                      {rewardText || t("deliveryGoals.defaultReward")}
                    </span>
                  </>
                )}
              </span>
              <span className="text-xs font-black text-pink-500">{simulatedProgress}%</span>
            </div>
            <div className="h-2.5 w-full bg-pink-100/70 dark:bg-[#1A1220] rounded-full overflow-hidden p-0.5 border border-pink-200/50 dark:border-pink-950">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${simulatedProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t("deliveryGoals.milestoneTitleFull")}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("deliveryGoals.defaultTitle")}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-slate-400">{t("deliveryGoals.titleHint")}</p>
        </div>

        {/* Threshold & Order */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t("deliveryGoals.thresholdFull")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="30.00"
                className={`${inputClass} pl-8 font-mono font-bold`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t("deliveryGoals.sortOrder")}
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        {/* Reward Text when Unlocked */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t("deliveryGoals.rewardTextFull")}
          </label>
          <input
            type="text"
            value={rewardText}
            onChange={(e) => setRewardText(e.target.value)}
            placeholder={t("deliveryGoals.defaultReward")}
            className={inputClass}
          />
        </div>

        {/* Emoji Icons */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t("deliveryGoals.activeIcon")}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-14 px-2 py-2 text-center text-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <div className="flex flex-wrap gap-1">
                {EMOJI_SUGGESTIONS.slice(0, 4).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className="w-8 h-8 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950 flex items-center justify-center text-base"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t("deliveryGoals.unlockedIconFull")}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={unlockedIcon}
                onChange={(e) => setUnlockedIcon(e.target.value)}
                className="w-14 px-2 py-2 text-center text-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <div className="flex flex-wrap gap-1">
                {UNLOCKED_SUGGESTIONS.slice(0, 4).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setUnlockedIcon(em)}
                    className="w-8 h-8 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950 flex items-center justify-center text-base"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          {/* Hide / Show Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                {isActive ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                {t("deliveryGoals.statusLabel")}{" "}
                {isActive ? t("deliveryGoals.showingActive") : t("deliveryGoals.hiddenInactive")}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("deliveryGoals.toggleStatusHint")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-700/60" />

          {/* Show on Cart */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t("deliveryGoals.showOnCartFull")}
            </span>
            <input
              type="checkbox"
              checked={showOnCart}
              onChange={(e) => setShowOnCart(e.target.checked)}
              className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 border-slate-300"
            />
          </div>

          {/* Show on Top Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t("deliveryGoals.showOnTopFull")}
            </span>
            <input
              type="checkbox"
              checked={showOnTop}
              onChange={(e) => setShowOnTop(e.target.checked)}
              className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 border-slate-300"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/25 active:scale-95 transition disabled:opacity-50"
          >
            {saving
              ? t("common.saving")
              : milestone
              ? t("deliveryGoals.saveChanges")
              : t("deliveryGoals.createMilestone")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
