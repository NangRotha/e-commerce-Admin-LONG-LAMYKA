import { useRef, useState } from "react";
import { Camera, Trash2, Save, Eye, EyeOff, User, Mail, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export default function Profile() {
  const { user, profileAvatar, profileName, refreshProfile } = useAuth();
  const { t } = useI18n();

  // Display name
  const [name, setName] = useState(profileName || "");
  const [savingName, setSavingName] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState(profileAvatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Feedback
  const [msg, setMsg] = useState({ text: "", type: "" });

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  };

  // ─── Avatar Upload ───────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await api.uploadProfileAvatar(file);
      await api.updateSetting("profile_avatar", res.url);
      setAvatarUrl(res.url);
      refreshProfile();
      flash(t("profile.savedPhoto"));
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const removeAvatar = async () => {
    try {
      await api.updateSetting("profile_avatar", "");
      setAvatarUrl("");
      refreshProfile();
      flash(t("profile.removedPhoto"));
    } catch (err) {
      flash(err.message, "error");
    }
  };

  // ─── Display Name ────────────────────────────────────────────
  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await api.updateSetting("admin_name", name.trim());
      refreshProfile();
      flash(t("profile.savedName"));
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSavingName(false);
    }
  };

  // ─── Password ────────────────────────────────────────────────
  const savePassword = async (e) => {
    e.preventDefault();
    if (!newPw || newPw !== confirmPw) {
      flash(t("profile.errorMismatch"), "error");
      return;
    }
    if (newPw.length < 6) {
      flash(t("profile.errorShort"), "error");
      return;
    }
    setSavingPw(true);
    try {
      // Try the backend change-password endpoint if available
      await api.updateSetting("__change_password__", JSON.stringify({ current: currentPw, new: newPw }));
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      flash(t("profile.savedPassword"));
    } catch (err) {
      flash(err.message || t("profile.errorUpdate"), "error");
    } finally {
      setSavingPw(false);
    }
  };

  // Initials fallback
  const initial = (profileName || user?.email || "A")[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("profile.title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("profile.subtitle")}
          </p>
        </div>
      </div>

      {/* Toast Message */}
      {msg.text && (
        <div className={`flex items-center gap-3 text-sm rounded-2xl p-4 animate-fade-in border ${
          msg.type === "error"
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60"
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60"
        }`}>
          {msg.type === "error"
            ? <AlertCircle className="w-5 h-5 shrink-0" />
            : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="font-semibold">{msg.text}</span>
        </div>
      )}

      {/* ─── Avatar Card ─── */}
      <div className="clay-card-purple p-6 sm:p-8">
        <h2 className="text-base font-black text-slate-800 dark:text-white mb-5">
          {t("profile.photoTitle")}
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle */}
          <div className="relative group shrink-0">
            <div
              className="w-28 h-28 rounded-full overflow-hidden shadow-lg"
              style={{ border: "4px solid white" }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={t("profile.photoTitle")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                  {initial}
                </div>
              )}
            </div>

            {/* Overlay on hover */}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Upload / Remove controls */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <p className="text-sm text-slate-500 dark:text-purple-200/70 font-medium">
              {t("profile.photoHint")}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {uploadingAvatar ? t("profile.uploading") : t("profile.uploadPhoto")}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("profile.removePhoto")}
                </button>
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      {/* ─── Account Info Card ─── */}
      <div className="clay-card p-6 sm:p-8">
        <h2 className="text-base font-black text-slate-800 dark:text-white mb-5">
          {t("profile.accountTitle")}
        </h2>

        <form onSubmit={saveName} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.displayName")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.displayNamePlaceholder")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm transition"
                />
              </div>
              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 shrink-0"
              >
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("common.save")}
              </button>
            </div>
          </div>

          {/* Email (read-only from JWT) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t("profile.emailReadOnly")}</p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.role")}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 w-4 h-4 text-violet-500" />
              <input
                type="text"
                value={t("profile.roleValue")}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-violet-600 dark:text-violet-400 font-bold text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </form>
      </div>

      {/* ─── Change Password Card ─── */}
      <div className="clay-card-pink p-6 sm:p-8">
        <h2 className="text-base font-black text-slate-800 dark:text-white mb-5">
          {t("profile.passwordTitle")}
        </h2>

        <form onSubmit={savePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.currentPassword")}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder={t("profile.currentPasswordPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-100 dark:border-pink-900/60 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 text-sm pr-10 transition"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.newPassword")}
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder={t("profile.newPasswordHint")}
              className="w-full px-4 py-2.5 rounded-xl border border-pink-100 dark:border-pink-900/60 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 text-sm transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("profile.confirmPassword")}
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder={t("profile.confirmPasswordPlaceholder")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 text-sm transition ${
                confirmPw && confirmPw !== newPw
                  ? "border-rose-400 focus:ring-rose-500/30"
                  : "border-pink-100 dark:border-pink-900/60 focus:ring-pink-500/30"
              }`}
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                {t("profile.passwordMismatch")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={savingPw || !currentPw || !newPw || newPw !== confirmPw}
            className="w-full py-2.5 rounded-xl bg-[#ff7b8f] hover:bg-[#ff5a75] text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
          >
            {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingPw ? t("profile.updating") : t("profile.updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
