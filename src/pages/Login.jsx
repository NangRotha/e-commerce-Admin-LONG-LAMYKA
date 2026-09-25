import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CreditCard,
  ExternalLink,
  Check,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "../components/HeaderControls";

const REMEMBER_EMAIL_KEY = "admin_remember_email";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [site, setSite] = useState({});
  useEffect(() => {
    api
      .getSettings()
      .then(setSite)
      .catch(() => {});
  }, []);

  const siteName = (site.site_name || "").trim() || "LONG LAMYKA";
  const siteLogo = (site.site_logo || "").trim();

  // Remember email initialization
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return !!localStorage.getItem(REMEMBER_EMAIL_KEY);
    } catch {
      return false;
    }
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Caps lock listener
  const checkCapsLock = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleQuickDemo = () => {
    setEmail("admin@example.com");
    setPassword("admin12345");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);

      // Save or remove remembered email
      try {
        if (rememberMe && email.trim()) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {}

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  // Dynamic storefront URL
  const storefrontUrl =
    typeof window !== "undefined" && window.location.hostname.includes("localhost")
      ? "http://localhost:5173"
      : "https://www.lamykacolletion.online";

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#FFF5F8] via-[#FDF0F5] to-[#FCE7F0] dark:from-[#0c0810] dark:via-[#130d19] dark:to-[#0e0914] flex flex-col justify-between p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden selection:bg-pink-200 selection:text-pink-900">
      {/* Decorative ambient background lighting & floating pastel orbs */}
      <div className="fixed -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-pink-300/25 dark:bg-pink-600/10 blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="fixed -bottom-32 -right-32 w-96 sm:w-[32rem] h-96 sm:h-[32rem] rounded-full bg-rose-300/20 dark:bg-rose-600/10 blur-3xl pointer-events-none -z-10 animate-float-delayed" />
      <div className="fixed top-1/2 left-1/4 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-purple-200/20 dark:bg-purple-900/10 blur-2xl pointer-events-none -z-10" />

      {/* Top Header Bar: Clean Responsive Layout */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 mb-4 sm:mb-6 z-20">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-[#181120]/70 hover:bg-white dark:hover:bg-[#1e1528] border border-pink-100 dark:border-pink-950/60 shadow-2xs backdrop-blur-md transition-all duration-200 hover:scale-[1.02] group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
            {t("login.storefrontLink")}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-500 transition-colors" />
        </a>

        {/* Language & Theme switcher */}
        <HeaderControls className="backdrop-blur-md bg-white/85 dark:bg-[#160f1c]/85 p-1 rounded-full shadow-2xs border border-pink-100/90 dark:border-pink-950/70 shrink-0" />
      </header>

      {/* Main Login Card (Glassmorphism & Responsive Grid) */}
      <main className="w-full max-w-6xl mx-auto my-auto z-10 flex items-center justify-center">
        <div className="w-full rounded-2xl xs:rounded-3xl sm:rounded-[36px] bg-white/95 dark:bg-[#150e1b]/95 backdrop-blur-2xl border border-pink-200/80 dark:border-pink-900/40 shadow-2xl shadow-pink-500/10 dark:shadow-black/70 overflow-hidden animate-pop-in transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[580px] lg:min-h-[620px]">
            {/* Left Column: Form Section */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between p-5 xs:p-6 sm:p-9 md:p-10 lg:p-12 z-10">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {siteLogo ? (
                      <div className="p-1 rounded-2xl bg-white dark:bg-[#1A1220] border border-pink-200/70 dark:border-pink-900/50 shadow-marshmallow transition-transform hover:scale-105 shrink-0 overflow-hidden">
                        <img
                          src={siteLogo}
                          alt={siteName}
                          className="h-8 sm:h-9 w-auto max-w-[120px] object-contain rounded-xl"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="font-extrabold tracking-wider text-sm sm:text-base bg-gradient-to-r from-slate-900 via-pink-950 to-rose-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase block">
                        {siteName}
                      </span>
                      <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 tracking-wide uppercase flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Admin Console
                      </span>
                    </div>
                  </div>

                  {/* System Status Pill */}
                  <span className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t("login.systemOnline")}</span>
                  </span>
                </div>

                {/* Heading & Subtitle */}
                <div className="mb-5 sm:mb-7">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t("login.title")}
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {t("login.subtitle")}
                  </p>
                </div>

                {/* Quick Demo Credentials Helper */}
                <div className="mb-5 p-2.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                    <Zap className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="truncate">admin@example.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E1526] hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-300 font-bold text-[11px] shadow-2xs border border-pink-200/60 dark:border-pink-900/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title={t("login.quickFillDemo")}
                  >
                    {t("login.quickFill")}
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 flex items-start justify-between gap-2.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 animate-shake">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-rose-500" />
                      <span className="leading-snug">{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="p-1 rounded-lg hover:bg-rose-200/50 dark:hover:bg-rose-900/50 text-rose-500 transition-colors"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      {t("login.email")}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        autoComplete="username"
                        className="w-full pl-10.5 pr-10 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-pink-950/60 bg-slate-50/60 dark:bg-[#1e1526] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition-all placeholder:text-slate-400"
                      />
                      {email && (
                        <button
                          type="button"
                          onClick={() => setEmail("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title={t("login.clear")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {t("login.password")}
                      </label>
                      {capsLockActive && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 px-2 py-0.5 rounded-md animate-pulse">
                          {t("login.capsLockOn")}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={checkCapsLock}
                        onKeyUp={checkCapsLock}
                        placeholder={t("login.passwordPlaceholder")}
                        autoComplete="current-password"
                        className="w-full pl-10.5 pr-11 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-pink-950/60 bg-slate-50/60 dark:bg-[#1e1526] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={
                          showPassword ? t("login.hidePassword") : t("login.showPassword")
                        }
                        title={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember Me */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 dark:border-pink-950 text-pink-600 focus:ring-pink-500/30 focus:ring-offset-0 cursor-pointer accent-pink-500"
                      />
                      <span>{t("login.rememberMe")}</span>
                    </label>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                      256-bit SSL
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t("login.signingIn")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("login.signIn")}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Mobile Feature Badges (Visible on small screens only) */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-pink-950/60 md:hidden flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center gap-1 font-medium">
                    ⚡ {t("login.badgeKhqrTitle")}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center gap-1 font-medium">
                    📊 {t("login.badgeAnalyticsTitle")}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center gap-1 font-medium">
                    🔒 {t("login.securePortal")}
                  </span>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-pink-950/60 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                <span className="truncate pr-2">{t("login.adminOnly")}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  {t("login.securePortal")}
                </span>
              </div>
            </div>

            {/* Right Column: Modern Interactive Management Showcase (Tablet & Desktop) */}
            <div className="hidden md:flex md:col-span-6 lg:col-span-7 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-purple-50/50 dark:from-[#1b1222] dark:via-[#160e1d] dark:to-[#120a17] border-t md:border-t-0 md:border-l border-pink-100 dark:border-pink-950/60 flex-col justify-between p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              {/* Soft decorative background glow circles */}
              <div className="absolute w-72 h-72 rounded-full bg-pink-400/15 blur-3xl -top-12 -right-12 pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full bg-rose-400/15 blur-3xl -bottom-10 -left-10 pointer-events-none" />

              {/* Showcase Top Tagline */}
              <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-[#1E1526]/80 text-pink-600 dark:text-pink-400 border border-pink-200/70 dark:border-pink-900/50 shadow-2xs backdrop-blur-md">
                    <span>🎀</span>
                    <span>{t("login.showcaseTitle")}</span>
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                    {t("login.showcaseSubtitle")}
                  </p>
                </div>
              </div>

              {/* Central Illustration Area with Floating Glass Cards */}
              <div className="relative z-10 flex-1 flex items-center justify-center py-4 my-auto">
                <div className="relative w-full max-w-md lg:max-w-lg transition-transform duration-500 hover:scale-[1.02]">
                  {/* Floating Card 1: KHQR Automation */}
                  <div className="absolute -top-4 -left-2 sm:-left-4 z-20 p-2.5 sm:p-3 rounded-2xl bg-white/90 dark:bg-[#1C1324]/90 backdrop-blur-xl border border-pink-100/90 dark:border-pink-900/50 shadow-lg shadow-pink-500/10 flex items-center gap-2.5 animate-float select-none">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="pr-1 text-left">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                        <span>{t("login.badgeKhqrTitle")}</span>
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                        {t("login.badgeKhqrSub")}
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 2: Analytics & Live Sync */}
                  <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 p-2.5 sm:p-3 rounded-2xl bg-white/90 dark:bg-[#1C1324]/90 backdrop-blur-xl border border-pink-100/90 dark:border-pink-900/50 shadow-lg shadow-pink-500/10 flex items-center gap-2.5 animate-float-delayed select-none">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="pr-1 text-left">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <span>{t("login.badgeAnalyticsTitle")}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                          +24.8%
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                        {t("login.badgeAnalyticsSub")}
                      </div>
                    </div>
                  </div>

                  {/* Main Illustration */}
                  <div className="relative p-2 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-[#160f1e]/60 border border-pink-100/70 dark:border-pink-900/40 shadow-xl overflow-hidden backdrop-blur-sm">
                    <img
                      src="/login-illustration.png"
                      alt={t("login.illustrationAlt")}
                      className="w-full h-auto max-h-[300px] lg:max-h-[340px] object-contain drop-shadow-sm select-none pointer-events-none mx-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Feature Pill Grid */}
              <div className="relative z-10 pt-4 border-t border-pink-100/80 dark:border-pink-950/60 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#181120]/60 border border-pink-100/60 dark:border-pink-950/50 backdrop-blur-sm">
                  <div className="text-sm">🇰🇭 🇬🇧</div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {t("login.featureBilingual")}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#181120]/60 border border-pink-100/60 dark:border-pink-950/50 backdrop-blur-sm">
                  <div className="text-sm">🚚 📦</div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {t("login.featureNationwide")}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#181120]/60 border border-pink-100/60 dark:border-pink-950/50 backdrop-blur-sm">
                  <div className="text-sm">🔒 🛡️</div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {t("login.featureSecurity")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Bottom Copyright */}
      <footer className="w-full max-w-6xl mx-auto text-center mt-4 sm:mt-6 z-20 text-[11px] text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </footer>
    </div>
  );
}

