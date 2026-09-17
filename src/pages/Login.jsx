import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "../components/HeaderControls";

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

  const siteName = site.site_name || "REERUI STORE";
  const siteLogo = site.site_logo || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#EBF3FE] via-[#F3F7FF] to-[#DFEDFE] dark:from-[#0b1120] dark:via-[#0f172a] dark:to-[#090d16] flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-x-hidden">
      {/* Decorative ambient background curves */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/20 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-sky-200/30 dark:bg-sky-600/5 blur-2xl pointer-events-none" />

      {/* Top right language & theme controls */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-20">
        <HeaderControls className="backdrop-blur-md bg-white/70 dark:bg-slate-800/80 p-1 rounded-full shadow-xs border border-slate-200/60 dark:border-slate-700" />
      </div>

      {/* Main Container Card (inspired by modern dashboard login mockup) */}
      <div className="relative w-full max-w-5xl rounded-2xl sm:rounded-[36px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-blue-200/70 dark:border-blue-900/40 shadow-2xl shadow-blue-500/10 dark:shadow-black/50 overflow-hidden animate-pop-in my-10 sm:my-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 sm:min-h-[580px]">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-10 md:p-12 z-10">
            <div>
              {/* Brand logo / title */}
              <div className="flex items-center gap-2.5 mb-6 sm:mb-10">
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="h-8 w-auto max-w-[140px] object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                    <Store className="w-5 h-5" />
                  </div>
                )}
                <span className="font-extrabold tracking-wider text-sm sm:text-base text-slate-800 dark:text-white uppercase">
                  {siteName}
                </span>
              </div>

              {/* Heading */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {t("login.title") || "Login"}
                </h1>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 dark:text-slate-400 leading-relaxed font-normal">
                  {t("login.subtitle") || "Welcome to log in to your background management system."}
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="mb-6 flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t("login.email") || "Email"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      autoComplete="username"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t("login.password") || "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Please enter your password"
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-44 py-3.5 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("login.signingIn") || "Signing in..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("login.signIn") || "LOGIN"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer notice */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{t("login.adminOnly") || "Admin accounts only"}</span>
              <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <Lock className="w-3.5 h-3.5" />
                Secure Portal
              </span>
            </div>
          </div>

          {/* Right Column: High Fidelity Modern Analytics Illustration */}
          <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-blue-50/60 via-slate-50/40 to-blue-100/40 dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-900/60 border-l border-blue-100 dark:border-slate-800/80 items-center justify-center p-8 relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute w-72 h-72 rounded-full bg-blue-400/10 blur-2xl top-10 right-10 pointer-events-none" />
            <div className="absolute w-60 h-60 rounded-full bg-indigo-400/10 blur-2xl bottom-10 left-10 pointer-events-none" />

            <div className="relative w-full max-w-lg p-2 transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/login-illustration.png"
                alt="Admin Dashboard Analytics"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-md select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
