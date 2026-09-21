import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../theme/ThemeContext";
import { CambodiaFlag, EnglishFlag } from "./Flags";

/** Icon ព្រះអាទិត្យ / ព្រះចន្ទ */
function SunIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** ប៊ូតុងប្តូរភាសា (ខ្មែរ 🇰🇭 / English 🇬🇧) និង Theme (ភ្លឺ/ងងឹត) សម្រាប់ Admin */
export default function HeaderControls({ dark = false, className = "" }) {
  const { lang, setLang, languages, t } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* ===== Language with Flags ===== */}
      <div
        role="group"
        aria-label={t("nav.selectLanguage")}
        title={t("nav.language")}
        className={`inline-flex items-center gap-0.5 p-1 rounded-full border shadow-xs shrink-0 ${
          dark
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-100 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80"
        }`}
      >
        {languages.map((l) => {
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              aria-pressed={active}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs rounded-full transition-all duration-200 select-none ${
                active
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-xs"
                  : dark
                  ? "font-medium text-slate-400 hover:text-white hover:bg-slate-700/60"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
              }`}
            >
              {l.code === "km" ? (
                <CambodiaFlag className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0" />
              ) : (
                <EnglishFlag className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0" />
              )}
              <span className="hidden sm:inline">{l.label}</span>
              <span className="sm:hidden">{l.short}</span>
            </button>
          );
        })}
      </div>

      {/* ===== Theme ===== */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        title={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-90 overflow-hidden shrink-0 ${
          dark
            ? "border-pink-950/40 bg-[#1e1526] text-slate-300 hover:text-white hover:border-pink-500/50"
            : "border-pink-100 dark:border-pink-950/50 bg-white dark:bg-[#1e1526] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-pink-500 hover:ring-2 hover:ring-pink-500/20"
        }`}
      >
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? "translate-y-0 rotate-0 opacity-100 text-amber-400"
              : "-translate-y-8 rotate-90 opacity-0"
          }`}
        >
          <SunIcon className="w-4.5 h-4.5" />
        </span>
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? "translate-y-8 -rotate-90 opacity-0"
              : "translate-y-0 rotate-0 opacity-100"
          }`}
        >
          <MoonIcon className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}
