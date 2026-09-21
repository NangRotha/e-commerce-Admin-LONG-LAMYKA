import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Save,
  Upload,
  Trash2,
  Loader2,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Send,
  Share2,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { useRealtime } from "../context/RealtimeContext";

// ព័ត៌មាន Bakong Wallet ដែលរក្សាទុកក្នុង Site Settings (key => default)
const PAYMENT_DEFAULTS = {
  payment_company_name: "Udom Shop",
  payment_bakong_id: "Udom",
  payment_display_name: "Udom",
  payment_currency: "USD",
  payment_khr_rate: "4100",
  khqrcc_profile_id: "",
  khqrcc_secret_key: "",
};

const SOCIAL_DEFAULTS = {
  social_telegram: "",
  social_whatsapp: "",
  social_facebook: "",
  social_instagram: "",
  contact_phone: "",
};

const LOCATION_DEFAULTS = {
  store_maps_url: "",
  store_address_km: "",
  store_address_en: "",
};

const CURRENCIES = ["USD", "KHR"];

/**
 * Settings — Admin Panel
 * ✅ Site Name / Logo (Branding)
 * ✅ Social Media (Telegram · Facebook · Instagram · Phone)
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

  // Social media channels
  const [social, setSocial] = useState(SOCIAL_DEFAULTS);
  const [savingSocial, setSavingSocial] = useState(false);

  // Store Location & Google Maps
  const [loc, setLoc] = useState(LOCATION_DEFAULTS);
  const [savingLoc, setSavingLoc] = useState(false);

  // Bakong / KHQR payment settings
  const [pay, setPay] = useState(PAYMENT_DEFAULTS);
  const [savingPay, setSavingPay] = useState(false);
  const [gatewayEnabled, setGatewayEnabled] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  const load = useCallback(() => {
    api
      .getSettings()
      .then((s) => {
        setSiteName(s.site_name || "");
        setLogoUrl(s.site_logo || "");
        setSocial({
          social_telegram: s.social_telegram || s.telegram_url || "",
          social_whatsapp: s.social_whatsapp || s.whatsapp_url || "",
          social_facebook: s.social_facebook || s.facebook_url || "",
          social_instagram: s.social_instagram || s.instagram_url || "",
          contact_phone: s.contact_phone || "",
        });
        setLoc({
          store_maps_url:
            s.store_maps_url ||
            "https://maps.app.goo.gl/EaQbHNijNE7EHgmFA?g_st=ic",
          store_address_km:
            s.store_address_km ||
            "ផ្លូវចាក់សំរាម ស្ទឹងមានជ័យ, ភូមិដំណាក់ធំ, សង្កាត់ស្ទឹងមានជ័យទី២, ខណ្ឌមានជ័យ, រាជធានីភ្នំពេញ",
          store_address_en:
            s.store_address_en ||
            "Stoeung Meanchey, Damnak Thum, Sangkat Stung Meanchey 2, Khan Meanchey, Phnom Penh, Cambodia",
        });
        setPay({
          payment_company_name: s.payment_company_name || "Udom Shop",
          payment_bakong_id: s.payment_bakong_id || "Udom",
          payment_display_name: s.payment_display_name || "Udom",
          payment_currency: (s.payment_currency || "USD").toUpperCase(),
          payment_khr_rate: s.payment_khr_rate || "4100",
          khqrcc_profile_id: s.khqrcc_profile_id || "",
          khqrcc_secret_key: s.khqrcc_secret_key || "",
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

  // ===== Social Media Channels =====
  const setSocialField = (key, value) => setSocial((s) => ({ ...s, [key]: value }));

  const saveSocial = async (e) => {
    e.preventDefault();
    setError("");
    setSavingSocial(true);
    try {
      for (const key of Object.keys(SOCIAL_DEFAULTS)) {
        await api.updateSetting(key, String(social[key] ?? "").trim());
      }
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSocial(false);
    }
  };

  // ===== Store Location & Google Maps =====
  const setLocField = (key, value) => setLoc((l) => ({ ...l, [key]: value }));

  const saveLocation = async (e) => {
    e.preventDefault();
    setError("");
    setSavingLoc(true);
    try {
      for (const key of Object.keys(LOCATION_DEFAULTS)) {
        await api.updateSetting(key, String(loc[key] ?? "").trim());
      }
      flash(t("settings.saved"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingLoc(false);
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
    "mt-1.5 w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition duration-200 text-sm shadow-2xs";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-300";
  const card =
    "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 transition-all duration-300 shadow-xs";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("settings.subtitle")}</p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3 animate-fade-in">
          {error}
        </p>
      )}

      {msg && (
        <p className="text-sm text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 rounded-2xl px-4 py-3 animate-pop-in font-medium">
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
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 active:scale-[0.98] transition-all duration-200 text-sm"
          >
            <Save className="w-4 h-4" />
            {t("common.save")}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">{t("settings.siteNameHint")}</p>
        {siteName && (
          <button
            onClick={clearSiteName}
            className="mt-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors"
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
              className="h-16 w-16 rounded-2xl border border-pink-200/80 dark:border-pink-900/50 bg-pink-50/50 dark:bg-slate-800 object-contain p-2 transition-transform duration-300 hover:scale-105"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl border border-dashed border-pink-300 dark:border-pink-900/50 bg-pink-50/40 dark:bg-slate-800 flex items-center justify-center text-2xl">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                  {t("settings.uploading")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-pink-500" />
                  {t("settings.uploadLogo")}
                </>
              )}
            </label>
            {logoUrl && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-200 active:scale-95"
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
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-sm shadow-pink-500/25 active:scale-[0.98] transition-all duration-200 text-sm"
            >
              <Save className="w-4 h-4" />
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>

      {/* ============ Free Delivery & Milestone Goals Quick Card ============ */}
      <div className={card}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200/60 dark:border-pink-900/50 flex items-center justify-center text-2xl shrink-0">
              🎁
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Delivery Goals &amp; Milestone Banners
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set order amounts for Free Delivery, hide or show the progress banner, and update rewards in real time.
              </p>
            </div>
          </div>
          <Link
            to="/delivery-goals"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-sm shadow-pink-500/25 active:scale-95 transition"
          >
            Manage Goals &rarr;
          </Link>
        </div>
      </div>

      {/* ============ Social Media & Channels ============ */}
      <form
        onSubmit={saveSocial}
        className={`${card}`}
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Share2 className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("settings.socialTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("settings.socialHint")}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Telegram */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center shrink-0">
                <Send className="w-3.5 h-3.5" />
              </span>
              {t("settings.telegram")}
            </label>
            <input
              className={input}
              value={social.social_telegram}
              onChange={(e) => setSocialField("social_telegram", e.target.value)}
              placeholder="https://t.me/khmerudomet or @khmerudomet"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.telegramHint")}</p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </span>
              {t("settings.whatsapp")}
            </label>
            <input
              className={input}
              value={social.social_whatsapp}
              onChange={(e) => setSocialField("social_whatsapp", e.target.value)}
              placeholder="012 345 678 or https://wa.me/85512345678"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.whatsappHint")}</p>
          </div>

          {/* Facebook */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-xs shrink-0">
                f
              </span>
              {t("settings.facebook")}
            </label>
            <input
              className={input}
              value={social.social_facebook}
              onChange={(e) => setSocialField("social_facebook", e.target.value)}
              placeholder="https://facebook.com/khmerudomet"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.facebookHint")}</p>
          </div>

          {/* Instagram */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">
                ig
              </span>
              {t("settings.instagram")}
            </label>
            <input
              className={input}
              value={social.social_instagram}
              onChange={(e) => setSocialField("social_instagram", e.target.value)}
              placeholder="https://instagram.com/khmerudomet"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.instagramHint")}</p>
          </div>

          {/* Phone */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </span>
              {t("settings.phone")}
            </label>
            <input
              className={input}
              value={social.contact_phone}
              onChange={(e) => setSocialField("contact_phone", e.target.value)}
              placeholder="e.g. 012 345 678"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.phoneHint")}</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSocial}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition-all duration-200 text-sm shadow-sm shadow-pink-500/25 active:scale-95 disabled:opacity-60"
            >
              {savingSocial ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("settings.saveSocial")}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ============ Store Location & Google Maps ============ */}
      <form
        onSubmit={saveLocation}
        className={`${card}`}
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <MapPin className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("settings.locationTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("settings.locationHint")}
              </p>
            </div>
          </div>

          {loc.store_maps_url && (
            <a
              href={loc.store_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400 text-xs font-bold transition border border-pink-200/80 dark:border-pink-900 shrink-0"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {/* Google Maps URL */}
          <div>
            <label className={`${label} flex items-center justify-between`}>
              <span>{t("settings.mapsUrl")}</span>
              {loc.store_maps_url && (
                <a
                  href={loc.store_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden inline-flex items-center gap-1 text-xs font-bold text-pink-600"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              className={input}
              value={loc.store_maps_url}
              onChange={(e) => setLocField("store_maps_url", e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.mapsUrlHint")}</p>
          </div>

          {/* Address Khmer */}
          <div>
            <label className={label}>{t("settings.addressKm")}</label>
            <textarea
              rows={2}
              className={input}
              value={loc.store_address_km}
              onChange={(e) => setLocField("store_address_km", e.target.value)}
              placeholder="ផ្លូវ... ភូមិ... សង្កាត់... ខណ្ឌ... រាជធានីភ្នំពេញ"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.addressKmHint")}</p>
          </div>

          {/* Address English */}
          <div>
            <label className={label}>{t("settings.addressEn")}</label>
            <textarea
              rows={2}
              className={input}
              value={loc.store_address_en}
              onChange={(e) => setLocField("store_address_en", e.target.value)}
              placeholder="Street... Sangkat... Khan... Phnom Penh, Cambodia"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.addressEnHint")}</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingLoc}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition-all duration-200 text-sm shadow-sm shadow-pink-500/25 active:scale-95 disabled:opacity-60"
            >
              {savingLoc ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("settings.saveLocation")}
                </>
              )}
            </button>
          </div>
        </div>
      </form>


      {/* ============ Bakong Wallet / KHQR payment ============ */}
      <form
        onSubmit={savePayment}
        className={`${card}`}
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <Wallet className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("settings.bakongTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("settings.bakongHint")}</p>
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
              placeholder="Udom Shop"
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
              placeholder="Udom"
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
              placeholder="Udom"
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

          {/* ============ API Security Credentials ============ */}
          <div className="sm:col-span-2 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("settings.apiCredentialsTitle")}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t("settings.apiCredentialsHint")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{t("settings.profileId")}</label>
                <input
                  className={input}
                  value={pay.khqrcc_profile_id}
                  onChange={(e) => setPayField("khqrcc_profile_id", e.target.value)}
                  placeholder="MOgrEmjgLkEmYzovmfTH0HQUPLgJ6DFq"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  {t("settings.profileIdHint")}
                </p>
              </div>

              <div>
                <label className={label}>{t("settings.secretKey")}</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    className={`${input} pr-10`}
                    value={pay.khqrcc_secret_key}
                    onChange={(e) => setPayField("khqrcc_secret_key", e.target.value)}
                    placeholder="EIiW0sBH4vWjzeovF5bRC6WwDHJYzvfK"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {t("settings.secretKeyHint")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!pay.payment_bakong_id && (
          <p className="mt-4 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2">
            ⚠️ {t("settings.bakongMissing")}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingPay}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition-all duration-200 text-sm shadow-sm shadow-pink-500/25 active:scale-95 disabled:opacity-60"
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
