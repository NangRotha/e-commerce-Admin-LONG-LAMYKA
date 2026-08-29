import { useEffect, useRef, useState } from "react";
import { Save, Upload, Trash2, Loader2 } from "lucide-react";
import { api } from "../api/client";

export default function Settings() {
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const load = () =>
    api
      .getSettings()
      .then((s) => {
        setSiteName(s.site_name || "");
        setLogoUrl(s.site_logo || "");
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  // ===== Site Name (Create / Update) =====
  // រក្សាតម្លៃក្នុង State ដោយផ្ទាល់ (មិន load() ទេ កុំឲ្យលុបអ្វីដែលកំពុងវាយ)
  const saveSiteName = async (value) => {
    const name = (value ?? siteName).trim();
    setError("");
    try {
      await api.updateSetting("site_name", name);
      setSiteName(name);
      flash("✓ Site name saved");
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Site Name (Delete / Clear) =====
  const clearSiteName = async () => {
    setError("");
    try {
      await api.updateSetting("site_name", "");
      setSiteName("");
      flash("✓ Site name cleared");
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Logo: upload from computer =====
  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await api.uploadImage(file);
      await api.updateSetting("site_logo", res.url);
      setLogoUrl(res.url);
      flash("✓ Logo uploaded & saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ===== Logo: save URL =====
  const saveLogoUrl = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.updateSetting("site_logo", logoUrl.trim());
      setLogoUrl(logoUrl.trim());
      flash("✓ Logo URL saved");
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Logo (Delete / Remove) =====
  const removeLogo = async () => {
    setError("");
    try {
      await api.updateSetting("site_logo", "");
      setLogoUrl("");
      flash("✓ Logo removed");
    } catch (err) {
      setError(err.message);
    }
  };

  const input =
    "mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
  const label = "block text-sm font-medium text-slate-700";


  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Site name and logo appear on the customer-facing storefront.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {msg && (
        <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          {msg}
        </p>
      )}

      {/* ============ Site Name ============ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSiteName();
          }}
        >
          <label className={label}>Site name</label>
          <div className="mt-2 flex gap-3">
            <input
              className={input}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              onBlur={() => saveSiteName()}
              placeholder="e.g. My Shop"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Auto-saves when you leave the field. Shown in the storefront navbar &
          footer.
        </p>
        {siteName && (
          <button
            onClick={clearSiteName}
            className="mt-1 text-xs font-medium text-rose-500 hover:text-rose-700 transition"
          >
            Clear site name
          </button>
        )}
      </div>

      {/* ============ Logo ============ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <label className={label}>Logo</label>

        {/* Preview */}
        <div className="mt-3 flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Site logo preview"
              className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-50 object-contain p-1.5"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="h-16 w-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-2xl">
              🛍️
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadLogo}
              className="hidden"
              id="logo-file"
            />
            <label
              htmlFor="logo-file"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload logo
                </>
              )}
            </label>
            {logoUrl && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Or paste URL */}
        <form onSubmit={saveLogoUrl} className="mt-4">
          <label className={`${label} text-slate-500`}>Or paste logo URL</label>
          <div className="mt-2 flex gap-3">
            <input
              className={input}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

