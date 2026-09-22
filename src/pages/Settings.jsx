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
  RotateCcw,
  Code2,
  Info,
  Clock,
} from "lucide-react";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { useRealtime } from "../context/RealtimeContext";
import {
  LOCATION_DEFAULTS,
  DEFAULT_MAP_PREVIEW,
  extractMapEmbedUrl,
} from "../utils/location";

// ព័ត៌មាន Bakong Wallet ដែលរក្សាទុកក្នុង Site Settings (key => default)
const PAYMENT_DEFAULTS = {
  payment_company_name: "LONG LAMYKA Store",
  payment_bakong_id: "yung in by L.LONG",
  payment_display_name: "LONG LAMYKA",
  payment_currency: "USD",
  payment_khr_rate: "4100",
  khqrcc_profile_id: "sRX1Zv0aWZwTZ9idvksdAmCJly6LAHh8",
  khqrcc_secret_key: "CtOah7bQW44Cs9Bn1AVhDQrAbZWgzHbn",
};

const TELEGRAM_DEFAULTS = {
  telegram_bot_token: "8508582321:AAE1MAImR77qzlKIDfKC75oaTT_iyGqHm90",
  telegram_bot_username: "Lamykabot",
  telegram_chat_id: "",
};

const SOCIAL_DEFAULTS = {
  social_telegram: "",
  social_whatsapp: "",
  social_facebook: "",
  social_instagram: "",
  social_tiktok: "",
  contact_phone: "",
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

  // Telegram Bot settings & alerts
  const [telegram, setTelegram] = useState(TELEGRAM_DEFAULTS);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);

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
          social_tiktok: s.social_tiktok || "",
          contact_phone: s.contact_phone || "",
        });
        setTelegram({
          telegram_bot_token:
            s.telegram_bot_token ||
            "8508582321:AAE1MAImR77qzlKIDfKC75oaTT_iyGqHm90",
          telegram_bot_username: s.telegram_bot_username || "Lamykabot",
          telegram_chat_id: s.telegram_chat_id || "",
        });
        setLoc({
          store_maps_url:
            s.store_maps_url !== undefined
              ? s.store_maps_url
              : LOCATION_DEFAULTS.store_maps_url,
          store_maps_embed_url:
            s.store_maps_embed_url !== undefined
              ? s.store_maps_embed_url
              : "",
          store_address_km:
            s.store_address_km !== undefined
              ? s.store_address_km
              : LOCATION_DEFAULTS.store_address_km,
          store_address_en:
            s.store_address_en !== undefined
              ? s.store_address_en
              : LOCATION_DEFAULTS.store_address_en,
          store_hours_km:
            s.store_hours_km !== undefined
              ? s.store_hours_km
              : LOCATION_DEFAULTS.store_hours_km,
          store_hours_en:
            s.store_hours_en !== undefined
              ? s.store_hours_en
              : LOCATION_DEFAULTS.store_hours_en,
        });
        setPay({
          payment_company_name: s.payment_company_name || "LONG LAMYKA Store",
          payment_bakong_id: s.payment_bakong_id || "yung in by L.LONG",
          payment_display_name: s.payment_display_name || "LONG LAMYKA",
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
    api
      .getTelegramStatus()
      .then(setTelegramStatus)
      .catch(() => {});
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

  // ===== Telegram Bot & Order Alerts =====
  const setTelegramField = (key, value) =>
    setTelegram((prev) => ({ ...prev, [key]: value }));

  const saveTelegram = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSavingTelegram(true);
    try {
      for (const key of Object.keys(TELEGRAM_DEFAULTS)) {
        await api.updateSetting(key, String(telegram[key] ?? "").trim());
      }
      flash(t("settings.saved") || "Telegram settings saved!");
      const status = await api.getTelegramStatus().catch(() => null);
      if (status) setTelegramStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    setError("");
    setTestingTelegram(true);
    try {
      const res = await api.testTelegram(telegram.telegram_chat_id);
      flash(res.message || "Notification sent to Telegram!");
    } catch (err) {
      setError(err.message);
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setError("");
    try {
      const res = await api.setTelegramWebhook();
      if (res.ok) {
        flash("Telegram Webhook registered successfully!");
      } else {
        setError(res.error || "Failed to register webhook");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Store Location & Google Maps =====
  const setLocField = (key, value) => setLoc((l) => ({ ...l, [key]: value }));

  const handleEmbedChange = (val) => {
    const extracted = extractMapEmbedUrl(val);
    setLocField("store_maps_embed_url", extracted || val);
  };

  const saveLocation = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSavingLoc(true);
    try {
      const cleanEmbedUrl = extractMapEmbedUrl(loc.store_maps_embed_url);
      const dataToSave = {
        ...loc,
        store_maps_embed_url: cleanEmbedUrl,
      };
      for (const key of Object.keys(LOCATION_DEFAULTS)) {
        await api.updateSetting(key, String(dataToSave[key] ?? "").trim());
      }
      setLoc((prev) => ({ ...prev, store_maps_embed_url: cleanEmbedUrl }));
      flash(t("settings.saved") || "Store location saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingLoc(false);
    }
  };

  const handleResetLocation = () => {
    if (
      window.confirm(
        "តើអ្នកពិតជាចង់កំណត់ព័ត៌មានទីតាំងហាងលំនាំដើមឡើងវិញមែនទេ? / Reset to default location?"
      )
    ) {
      setLoc(LOCATION_DEFAULTS);
      flash(
        "បានកំណត់តម្លៃលំនាំដើមឡើងវិញ (សូមចុចរក្សាទុក) / Defaults loaded (click Save to apply)"
      );
    }
  };

  const handleClearLocation = async () => {
    if (
      window.confirm(
        "តើអ្នកពិតជាចង់សម្អាត និងលុបព័ត៌មានទីតាំងទាំងអស់មែនទេ? / Clear all location fields?"
      )
    ) {
      const empty = {
        store_maps_url: "",
        store_maps_embed_url: "",
        store_address_km: "",
        store_address_en: "",
        store_hours_km: "",
        store_hours_en: "",
      };
      setLoc(empty);
      setSavingLoc(true);
      try {
        for (const key of Object.keys(LOCATION_DEFAULTS)) {
          await api.updateSetting(key, "");
        }
        flash(t("settings.saved") || "Location cleared successfully!");
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingLoc(false);
      }
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
    "mt-1.5 w-full px-4 py-2.5 rounded-2xl border border-pink-100/90 dark:border-pink-950/70 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition duration-200 text-sm shadow-2xs";
  const label = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-pink-200/70";
  const card =
    "luxury-card rounded-[28px] p-5 sm:p-7 shadow-xs transition-all duration-300 relative overflow-hidden";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("settings.subtitle")}</p>
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
              placeholder="https://t.me/Lamykabot or @Lamykabot"
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
              placeholder="https://facebook.com/LONG-LAMYKA"
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
              placeholder="https://instagram.com/longlamyka"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.instagramHint")}</p>
          </div>

          {/* TikTok */}
          <div>
            <label className={`${label} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-lg bg-[#010101]/10 text-[#010101] dark:text-slate-300 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
                </svg>
              </span>
              {t("settings.tiktok")}
            </label>
            <input
              className={input}
              value={social.social_tiktok}
              onChange={(e) => setSocialField("social_tiktok", e.target.value)}
              placeholder="https://tiktok.com/@longlamyka or @longlamyka"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.tiktokHint")}</p>
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

      {/* ============ Telegram Bot & Real-time Order Alerts ============ */}
      <div className={`${card}`} style={{ animationDelay: "70ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Telegram Bot &amp; Order Alerts
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#229ED9] animate-pulse" />
                  @{telegram.telegram_bot_username || "Lamykabot"}
                </span>
                {telegramStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      telegramStatus.enabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        telegramStatus.enabled ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {telegramStatus.enabled ? "Bot Active" : "Config Required"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                ទទួលដំណឹងភ្លាមៗលើ Telegram ពេលមាន Order ថ្មី ឬអតិថិជនបង់ប្រាក់តាម ABA Pay / KHQR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://t.me/${telegram.telegram_bot_username || "Lamykabot"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#229ED9] hover:bg-[#1e8cc0] text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <span>Open @{telegram.telegram_bot_username || "Lamykabot"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Instructions Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#229ED9]/5 border border-[#229ED9]/15 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <p className="font-bold text-[#229ED9] flex items-center gap-1.5">
            💡 របៀបភ្ជាប់ Bot ដើម្បីទទួលដំណឹង Order Alerts លើ Telegram៖
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 pl-1">
            <li>
              ចុចប៊ូតុង <b>"Open @Lamykabot"</b> ខាងលើ ឬស្វែងរក <b>@Lamykabot</b> ក្នុង Telegram។
            </li>
            <li>
              ចុចប៊ូតុង <b>Start</b> (ឬផ្ញើសារ <code>/start</code>) នោះ Bot នឹងឆ្លើយតបបង្ហាញ <b>Telegram Chat ID</b> របស់អ្នក។
            </li>
            <li>
              ចម្លងលេខនោះ យកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ <b>Admin Chat ID</b> ខាងក្រោម រួចចុច <b>រក្សាទុក Telegram Settings</b>។
            </li>
            <li>
              ចុច <b>"ផ្ញើសារតេស្ត (Test Alert)"</b> ដើម្បីសាកល្បងថាតើទទួលបានសារឬអត់!
            </li>
          </ol>
        </div>

        <form onSubmit={saveTelegram} className="mt-5 space-y-4">
          {/* Admin Chat ID */}
          <div>
            <div className="flex items-center justify-between">
              <label className={label}>
                Admin Telegram Chat ID (ទទួលដំណឹង Order)
              </label>
              {telegram.telegram_chat_id ? (
                <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Chat ID បានកំណត់រួច
                </span>
              ) : (
                <span className="text-amber-500 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  មិនទាន់កំណត់ (ផ្ញើ /start ទៅ Bot ដើម្បីដឹង)
                </span>
              )}
            </div>
            <input
              className={input}
              value={telegram.telegram_chat_id}
              onChange={(e) => setTelegramField("telegram_chat_id", e.target.value)}
              placeholder="ឧទាហរណ៍: 123456789 (លេខ Chat ID ផ្ទាល់ខ្លួន ឬ ID នៃ Group)"
            />
            <p className="mt-1 text-xs text-slate-400">
              រាល់ពេលអតិថិជនកុម្ម៉ង់ទំនិញ ឬបង់ប្រាក់ជោគជ័យ ប្រព័ន្ធនឹងផ្ញើសារលម្អិតទៅកាន់ Telegram នេះភ្លាមៗ។
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bot Username */}
            <div>
              <label className={label}>Bot Username</label>
              <input
                className={input}
                value={telegram.telegram_bot_username}
                onChange={(e) => setTelegramField("telegram_bot_username", e.target.value)}
                placeholder="Lamykabot"
              />
            </div>

            {/* Bot Token */}
            <div>
              <div className="flex items-center justify-between">
                <label className={label}>Bot Token (ពី @BotFather)</label>
                <button
                  type="button"
                  onClick={() => setShowTelegramToken(!showTelegramToken)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  {showTelegramToken ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Show
                    </>
                  )}
                </button>
              </div>
              <input
                type={showTelegramToken ? "text" : "password"}
                className={input}
                value={telegram.telegram_bot_token}
                onChange={(e) => setTelegramField("telegram_bot_token", e.target.value)}
                placeholder="8508582321:AAE1MAImR77qzlKIDfKC75oaTT_iyGqHm90"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingTelegram}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#229ED9] to-sky-600 hover:from-[#1e8cc0] hover:to-sky-700 text-white font-semibold transition-all duration-200 text-sm shadow-sm active:scale-95 disabled:opacity-60"
            >
              {savingTelegram ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុក Telegram Settings</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={testingTelegram || !telegram.telegram_chat_id}
              onClick={handleTestTelegram}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#229ED9]/40 text-[#229ED9] dark:text-sky-400 hover:bg-[#229ED9]/10 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {testingTelegram ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងតេស្ត...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ផ្ញើសារតេស្ត (Test Alert)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRegisterWebhook}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline ml-auto"
            >
              Sync Webhook
            </button>
          </div>
        </form>
      </div>

      {/* ============ Store Location & Google Maps ============ */}
      <form
        onSubmit={saveLocation}
        className={`${card}`}
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-2xs">
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

          <div className="flex items-center gap-2 self-start shrink-0">
            {loc.store_maps_url && (
              <a
                href={loc.store_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400 text-xs font-bold transition border border-pink-200/80 dark:border-pink-900"
              >
                <span>{t("settings.testMap") || "Google Maps"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleResetLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              title={t("settings.resetLocation")}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("settings.resetLocation")}</span>
            </button>
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition"
              title={t("settings.clearLocation")}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("settings.clearLocation")}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Google Maps URL (App / Share link) */}
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
              value={loc.store_maps_url || ""}
              onChange={(e) => setLocField("store_maps_url", e.target.value)}
              placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.mapsUrlHint")}</p>
          </div>

          {/* Google Maps Embed Code / Iframe / URL */}
          <div>
            <div className="flex items-center justify-between">
              <label className={`${label} flex items-center gap-1.5`}>
                <Code2 className="w-3.5 h-3.5 text-pink-500" />
                <span>{t("settings.mapsEmbedUrl")}</span>
              </label>
              {loc.store_maps_embed_url && (
                <button
                  type="button"
                  onClick={() => setLocField("store_maps_embed_url", "")}
                  className="text-[11px] text-rose-500 hover:underline font-bold"
                >
                  {t("common.delete") || "Remove Embed"}
                </button>
              )}
            </div>
            <textarea
              rows={2}
              className={input}
              value={loc.store_maps_embed_url || ""}
              onChange={(e) => handleEmbedChange(e.target.value)}
              placeholder="<iframe src=&quot;https://www.google.com/maps/embed?pb=...&quot; ...></iframe> ឬ https://www.google.com/maps/embed?pb=..."
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.mapsEmbedUrlHint")}</p>

            {/* Instruction helper */}
            <div className="mt-2.5 p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/70 dark:border-pink-900/40 text-xs text-slate-600 dark:text-pink-200/80 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-pink-100 leading-relaxed">
                  {t("settings.mapsEmbedGuide")}
                </p>
              </div>
            </div>
          </div>

          {/* Live Map Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className={label}>{t("settings.mapsPreview")}</label>
              {loc.store_maps_embed_url ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t("settings.mapsPreviewActive")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-200 dark:border-amber-800/60">
                  <Info className="w-3 h-3" />
                  <span>{t("settings.mapsPreviewDefault")}</span>
                </span>
              )}
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-pink-100 dark:border-pink-900/60 shadow-xs relative h-60 sm:h-72 bg-slate-100 dark:bg-slate-900">
              <iframe
                title="Admin Map Preview"
                src={extractMapEmbedUrl(loc.store_maps_embed_url) || DEFAULT_MAP_PREVIEW}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Address Khmer */}
          <div>
            <label className={label}>{t("settings.addressKm")}</label>
            <textarea
              rows={2}
              className={input}
              value={loc.store_address_km || ""}
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
              value={loc.store_address_en || ""}
              onChange={(e) => setLocField("store_address_en", e.target.value)}
              placeholder="Street... Sangkat... Khan... Phnom Penh, Cambodia"
            />
            <p className="mt-1 text-xs text-slate-400">{t("settings.addressEnHint")}</p>
          </div>

          {/* Opening Hours Khmer & English */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`${label} flex items-center gap-1.5`}>
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                <span>{t("settings.hoursKm")}</span>
              </label>
              <input
                className={input}
                value={loc.store_hours_km || ""}
                onChange={(e) => setLocField("store_hours_km", e.target.value)}
                placeholder="៨:០០ ព្រឹក - ៨:៣០ យប់ (រៀងរាល់ថ្ងៃ)"
              />
              <p className="mt-1 text-xs text-slate-400">{t("settings.hoursKmHint")}</p>
            </div>
            <div>
              <label className={`${label} flex items-center gap-1.5`}>
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                <span>{t("settings.hoursEn")}</span>
              </label>
              <input
                className={input}
                value={loc.store_hours_en || ""}
                onChange={(e) => setLocField("store_hours_en", e.target.value)}
                placeholder="8:00 AM - 8:30 PM (Everyday)"
              />
              <p className="mt-1 text-xs text-slate-400">{t("settings.hoursEnHint")}</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 flex-wrap">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetLocation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("settings.resetLocation")}</span>
              </button>
              <button
                type="button"
                onClick={handleClearLocation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("settings.clearLocation")}</span>
              </button>
            </div>
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
                  placeholder="sRX1Zv0aWZwTZ9idvksdAmCJly6LAHh8"
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
                    placeholder="CtOah7bQW44Cs9Bn1AVhDQrAbZWgzHbn"
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
