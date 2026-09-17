import { useCallback, useEffect, useState } from "react";
import { Save, Upload, Trash2, Loader2, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { useRealtime } from "../context/RealtimeContext";

// ព័ត៌មាន Bakong Wallet ដែលរក្សាទុកក្នុង Site Settings (key => default)
const PAYMENT_DEFAULTS = {
  payment_company_name: "",
  payment_bakong_id: "",
  payment_display_name: "",
  payment_currency: "USD",
  payment_khr_rate: "4100",
};

const CURRENCIES = ["USD", "KHR"];

/**
 * Settings — Admin Panel
 * ✅ Site Name / Logo (Branding)
 * ✅ Bakong Wallet / KHQR payment: Company Name · Bakong Wallet ID · Display Name · Currency
 * ✅ Real-time: បើ Admin ផ្សេងកែ -> ទំព័រនេះបច្ចុប្បន្នភាពភ្លាមៗ (settings_changed)
 */
export default function Settings() {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  // Bakong / KHQR payment settings
  const [pay, setPay] = useState(PAYMENT_DEFAULTS);
  const [savingPay, setSavingPay] = useState(false);
  const [gatewayEnabled, setGatewayEnabled] = useState(null);

  const load = useCallback(() => {
    api
      .getSettings()
      .then((s) => {
        setSiteName(s.site_name || "");
        setLogoUrl(s.site_logo || "");
        setPay({
          payment_company_name: s.payment_company_name || "",
          payment_bakong_id: s.payment_bakong_id || "",
          payment_display_name: s.payment_display_name || "",
          payment_currency: (s.payment_currency || "USD").toUpperCase(),
          payment_khr_rate: s.payment_khr_rate || "4100",
        });
      })
      .catch((e) => setError(e.message));
    api
      .getPaymentConfig()
      .then((c) => setGatewayEnabled(!!c.enabled))
      .catch(() => setGatewayEnabled(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: Settings ត្រូវបានកែពីកន្លែងផ្សេង -> ទាញឡើងវិញ
  useRealtime("settings_changed", load);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  // ===== Site Name =====
  const saveSiteName = async (value) => {
    const name = (value ?? siteName).trim();
    setError("");
    try {
      await api.updateSetting("site_name", name);
      setSiteName(name);
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearSiteName = async () => {
    setError("");
    try {
      await api.updateSetting("site_name", "");
      setSiteName("");
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Logo =====
  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await api.uploadImage(file);
      await api.updateSetting("site_logo", res.url);
      setLogoUrl(res.url);
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeLogo = async () => {
    setError("");
    try {
      await api.updateSetting("site_logo", "");
      setLogoUrl("");
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Bakong Wallet / KHQR payment =====
  const setPayField = (key, value) => setPay((p) => ({ ...p, [key]: value }));

  const savePayment = async (e) => {
    e.preventDefault();
    setError("");
    setSavingPay(true);
    try {
      // រក្សាទុកម្តងមួយ key (API /api/settings/admin/update)
      for (const key of Object.keys(PAYMENT_DEFAULTS)) {
        await api.updateSetting(key, String(pay[key] ?? ""));
      }
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPay(false);
    }
  };

  const input =
    "mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition duration-200 text-sm";
  const label = "block text-sm font-medium text-slate-700";
  const card =
    "bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-soft animate-fade-in-up";

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("settings.subtitle")}</p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-in">
          {error}
        </p>
      )}

      {msg && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-pop-in">
          {msg}
        </p>
      )}

      {/* ============ Site name ============ */}
      <div className={card}>
        <label className={label}>{t("settings.siteName")}</label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSiteName();
          }}
          className="mt-2 flex gap-3"
        >
          <input
            className={input}
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="My Shop"
          />
          <button
            type="submit"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 text-sm active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t("common.save")}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">{t("settings.siteNameHint")}</p>
        {siteName && (
          <button
            onClick={clearSiteName}
            className="mt-1 text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
          >
            {t("settings.clearSiteName")}
          </button>
        )}
      </div>

      {/* ============ Logo ============ */}
      <div className={card}>
        <label className={label}>{t("settings.siteLogo")}</label>
        <div className="mt-3 flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Site logo preview"
              className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-50 object-contain p-1.5 transition-transform duration-300 hover:scale-105"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="h-16 w-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-2xl">
              🛍️
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={uploadLogo}
              className="hidden"
              id="logo-file"
            />
            <label
              htmlFor="logo-file"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-all duration-200 active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("settings.uploading")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t("settings.uploadLogo")}
                </>
              )}
            </label>
            {logoUrl && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all duration-200 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                {t("settings.remove")}
              </button>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            api
              .updateSetting("site_logo", logoUrl.trim())
              .then(() => flash(t("settings.saved")))
              .catch((err) => setError(err.message));
          }}
          className="mt-4"
        >
          <label className={`${label} text-slate-500`}>
            {t("settings.pasteUrl")}
          </label>
          <div className="mt-2 flex gap-3">
            <input
              className={input}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 text-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>

      {/* ============ Bakong Wallet / KHQR payment ============ */}
      <form
        onSubmit={savePayment}
        className={`${card}`}
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">
              {t("settings.bakongTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t("settings.bakongHint")}</p>
          </div>
        </div>

        {/* Gateway status */}
        <div className="mt-4">
          {gatewayEnabled === true && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("settings.gatewayEnabled")}
            </span>
          )}
          {gatewayEnabled === false && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t("settings.gatewayDisabled")}
            </span>
          )}
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("settings.companyName")}</label>
            <input
              className={input}
              value={pay.payment_company_name}
              onChange={(e) => setPayField("payment_company_name", e.target.value)}
              placeholder="KHMER UDOM ET"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {t("settings.companyNameHint")}
            </p>
          </div>

          <div>
            <label className={label}>{t("settings.displayName")}</label>
            <input
              className={input}
              value={pay.payment_display_name}
              onChange={(e) => setPayField("payment_display_name", e.target.value)}
              placeholder="Udom ET"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {t("settings.displayNameHint")}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={label}>{t("settings.bakongId")}</label>
            <input
              className={input}
              value={pay.payment_bakong_id}
              onChange={(e) => setPayField("payment_bakong_id", e.target.value)}
              placeholder="yourname@acleda"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {t("settings.bakongIdHint")}
            </p>
          </div>

          <div>
            <label className={label}>{t("settings.currency")}</label>
            <select
              className={input}
              value={pay.payment_currency}
              onChange={(e) => setPayField("payment_currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              {t("settings.currencyHint")}
            </p>
          </div>

          <div>
            <label className={label}>{t("settings.khrRate")}</label>
            <input
              type="number"
              min="1"
              step="1"
              className={input}
              value={pay.payment_khr_rate}
              onChange={(e) => setPayField("payment_khr_rate", e.target.value)}
              placeholder="4100"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {t("settings.khrRateHint")}
            </p>
          </div>
        </div>

        {!pay.payment_bakong_id && (
          <p className="mt-4 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            ⚠️ {t("settings.bakongMissing")}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingPay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 text-sm active:scale-95 disabled:opacity-60"
          >
            {savingPay ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("common.save")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
