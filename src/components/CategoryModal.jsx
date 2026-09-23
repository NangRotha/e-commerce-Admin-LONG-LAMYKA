import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import Modal from "./Modal";
import { useI18n } from "../i18n/I18nContext";

export default function CategoryModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: "",
    name_km: "",
    description: "",
    description_km: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || "",
        name_km: initial?.name_km || "",
        description: initial?.description || "",
        description_km: initial?.description_km || "",
      });
      setError("");
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError(t("categories.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        name_km: form.name_km.trim(),
        description: form.description.trim(),
        description_km: form.description_km.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 text-sm transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t("categories.editCategory") : t("categories.createCategory")}
      subtitle={initial ? t("categories.editSubtitle") : t("categories.addSubtitle")}
      icon={Tags}
      maxWidth="md"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("categories.nameEn")}</label>
            <input
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("categories.nameEnPlaceholder")}
              maxLength={60}
              autoFocus
            />
          </div>
          <div>
            <label className={label}>{t("categories.nameKm")}</label>
            <input
              className={input}
              value={form.name_km}
              onChange={(e) => setForm({ ...form, name_km: e.target.value })}
              placeholder={t("categories.nameKmPlaceholder")}
              maxLength={60}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("categories.descEn")}</label>
            <textarea
              className={input}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("categories.descEnPlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("categories.descKm")}</label>
            <textarea
              className={input}
              rows={2}
              value={form.description_km}
              onChange={(e) => setForm({ ...form, description_km: e.target.value })}
              placeholder={t("categories.descKmPlaceholder")}
            />
          </div>
        </div>

        <div className="pt-3 flex gap-3 justify-end border-t border-pink-100 dark:border-pink-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-md shadow-pink-500/25 transition text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving
              ? t("common.saving")
              : initial
              ? t("common.save")
              : t("categories.createCategory")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
