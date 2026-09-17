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
        className={`relative flex items-center rounded-full p-0.5 border shrink-0 ${
          dark
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}
      >
        <span
          className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-emerald-600 shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform:
              languages[0].code === lang
                ? "translateX(2px)"
                : "translateX(calc(100% + 2px))",
          }}
        />
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={`relative z-10 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-full transition-colors duration-300 ${
              lang === l.code
                ? "text-white"
                : dark
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {l.code === "km" ? (
              <CambodiaFlag className="w-3.5 h-2.5 sm:w-4 sm:h-2.5 rounded-xs shadow-2xs shrink-0" />
            ) : (
              <EnglishFlag className="w-3.5 h-2.5 sm:w-4 sm:h-2.5 rounded-xs shadow-2xs shrink-0" />
            )}
            <span className="hidden sm:inline">{l.label}</span>
            <span className="sm:hidden">{l.short}</span>
          </button>
        ))}
      </div>

      {/* ===== Theme ===== */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        title={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-90 overflow-hidden shrink-0 ${
          dark
            ? "border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? "translate-y-0 rotate-0 opacity-100"
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
