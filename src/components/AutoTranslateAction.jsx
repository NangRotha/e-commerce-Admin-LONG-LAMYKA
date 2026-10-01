import { useState } from "react";
import { Sparkles, Loader2, ArrowRightLeft, Languages, Check } from "lucide-react";

/**
 * AutoTranslateBar
 * Renders an AI auto-translate bar with one-click translations between English and Khmer.
 */
export function AutoTranslateBar({
  onTranslateAll,
  isTranslating = false,
  statusText = "",
  className = "",
}) {
  const [successPing, setSuccessPing] = useState(false);

  const handleEnToKm = async () => {
    if (isTranslating) return;
    try {
      await onTranslateAll("en_to_km");
      setSuccessPing(true);
      setTimeout(() => setSuccessPing(false), 2000);
    } catch {
      /* handled in parent */
    }
  };

  const handleKmToEn = async () => {
    if (isTranslating) return;
    try {
      await onTranslateAll("km_to_en");
      setSuccessPing(true);
      setTimeout(() => setSuccessPing(false), 2000);
    } catch {
      /* handled in parent */
    }
  };

  return (
    <div
      className={`p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-200/80 dark:border-purple-900/60 flex flex-wrap items-center justify-between gap-2.5 transition-all shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-800 dark:text-purple-100 flex items-center gap-1.5">
            <span>Gemini AI Auto-Translate</span>
            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-100/80 dark:bg-pink-950/80 px-1.5 py-0.2 rounded-full border border-pink-200/60 dark:border-pink-800/60">
              EN ⇄ KM
            </span>
          </span>
          <p className="text-[11px] text-slate-500 dark:text-purple-200/70 font-medium">
            {statusText || "Auto-fill missing translations with 1 click"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        {/* EN -> KM Button */}
        <button
          type="button"
          onClick={handleEnToKm}
          disabled={isTranslating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1424] text-purple-700 dark:text-purple-200 text-xs font-bold border border-purple-200/80 dark:border-purple-800/60 shadow-2xs hover:border-purple-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          title="Translate English fields to Khmer"
        >
          {isTranslating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
          ) : successPing ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
          ) : (
            <Languages className="w-3.5 h-3.5 text-pink-500" />
          )}
          <span>EN ➔ ខ្មែរ (KM)</span>
        </button>

        {/* KM -> EN Button */}
        <button
          type="button"
          onClick={handleKmToEn}
          disabled={isTranslating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1424] text-slate-700 dark:text-purple-200 text-xs font-bold border border-purple-200/80 dark:border-purple-800/60 shadow-2xs hover:border-purple-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          title="Translate Khmer fields to English"
        >
          {isTranslating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
          ) : (
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
          )}
          <span>ខ្មែរ ➔ EN</span>
        </button>
      </div>
    </div>
  );
}

/**
 * FieldTranslateButton
 * Small inline AI translate icon button beside an individual field (e.g. inside label).
 */
export function FieldTranslateButton({
  onClick,
  loading = false,
  title = "Auto-translate with Gemini AI",
  label = "Translate",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100/70 dark:hover:bg-pink-900/50 border border-pink-200/60 dark:border-pink-800/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      title={title}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-pink-600" />
      ) : (
        <Sparkles className="w-3 h-3 text-pink-500" />
      )}
      <span>{loading ? "Translating..." : label}</span>
    </button>
  );
}
