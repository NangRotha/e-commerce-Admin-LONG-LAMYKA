import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
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

  const siteName = site.site_name || "Admin Panel";
  const siteLogo = site.site_logo || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="absolute top-4 right-4">
            <HeaderControls dark />
          </div>
          <div className="flex items-center justify-center gap-2 text-white font-extrabold text-2xl mb-8">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                className="h-9 w-auto max-w-[160px] object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <Store className="w-7 h-7 text-emerald-500" />
            )}
            {!siteLogo && siteName}
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 animate-pop-in">
            <h1 className="text-2xl font-extrabold text-slate-900 text-center">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-500 text-center">
              {t("login.subtitle")}
            </p>

          {error && (
            <p className="mt-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("login.email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("login.password")}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            {t("login.adminOnly")}
          </p>
        </div>
      </div>
    </div>
  );
}
