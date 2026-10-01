import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import Modal from "./Modal";
import { useI18n } from "../i18n/I18nContext";
import { api } from "../api/client";
import { AutoTranslateBar, FieldTranslateButton } from "./AutoTranslateAction";

export default function CategoryModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: "",
    name_km: "",
    description: "",
    description_km: "",
  });
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [fieldTranslating, setFieldTranslating] = useState({});
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
      setFieldTranslating({});
      setTranslating(false);
    }
  }, [open, initial]);

  // Translate all fields (EN -> KM or KM -> EN)
  const handleTranslateAll = async (direction = "en_to_km") => {
    setError("");
    const isEnToKm = direction === "en_to_km";
    const srcLang = isEnToKm ? "en" : "km";
    const tgtLang = isEnToKm ? "km" : "en";

    // Gather fields to translate
    const fieldsToTranslate = {};
    if (isEnToKm) {
      if (form.name.trim()) fieldsToTranslate.name = form.name.trim();
      if (form.description.trim()) fieldsToTranslate.description = form.description.trim();
    } else {
      if (form.name_km.trim()) fieldsToTranslate.name_km = form.name_km.trim();
      if (form.description_km.trim()) fieldsToTranslate.description_km = form.description_km.trim();
    }

    if (Object.keys(fieldsToTranslate).length === 0) {
      setError(
        isEnToKm
          ? "Please type English category name or description first"
          : "Please type Khmer category name or description first"
      );
      return;
    }

    setTranslating(true);
    try {
      const res = await api.translate({
        fields: fieldsToTranslate,
        source_lang: srcLang,
        target_lang: tgtLang,
      });

      if (res?.translated_fields) {
        setForm((prev) => ({
          ...prev,
          name: isEnToKm
            ? prev.name
            : (res.translated_fields.name_km || res.translated_fields.name || prev.name),
          name_km: isEnToKm
            ? (res.translated_fields.name || res.translated_fields.name_km || prev.name_km)
            : prev.name_km,
          description: isEnToKm
            ? prev.description
            : (res.translated_fields.description_km || res.translated_fields.description || prev.description),
          description_km: isEnToKm
            ? (res.translated_fields.description || res.translated_fields.description_km || prev.description_km)
            : prev.description_km,
        }));
      }
    } catch (err) {
      setError(err.message || "Failed to auto-translate with Gemini AI");
    } finally {
      setTranslating(false);
    }
  };

  // Translate a single field
  const handleTranslateSingleField = async (sourceField, targetField, srcLang, tgtLang) => {
    const text = form[sourceField]?.trim();
    if (!text) return;
    setFieldTranslating((prev) => ({ ...prev, [targetField]: true }));
    setError("");
    try {
      const res = await api.translate({
        text,
        source_lang: srcLang,
        target_lang: tgtLang,
      });
      if (res?.translated_text) {
        setForm((prev) => ({ ...prev, [targetField]: res.translated_text }));
      }
    } catch (err) {
      setError(err.message || "Translation error");
    } finally {
      setFieldTranslating((prev) => ({ ...prev, [targetField]: false }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() && !form.name_km.trim()) {
      setError(t("categories.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim() || form.name_km.trim(),
        name_km: form.name_km.trim() || form.name.trim(),
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
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-in">
            {error}
          </p>
        )}

        {/* Gemini AI Auto-Translate Bar */}
        <AutoTranslateBar
          onTranslateAll={handleTranslateAll}
          isTranslating={translating}
          statusText="Translate name & description with Google Gemini"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className={label}>{t("categories.nameEn")}</label>
              {form.name_km && (
                <FieldTranslateButton
                  onClick={() => handleTranslateSingleField("name_km", "name", "km", "en")}
                  loading={fieldTranslating.name}
                  label="From KM"
                  title="Translate from Khmer to English"
                />
              )}
            </div>
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
            <div className="flex items-center justify-between">
              <label className={label}>{t("categories.nameKm")}</label>
              {form.name && (
                <FieldTranslateButton
                  onClick={() => handleTranslateSingleField("name", "name_km", "en", "km")}
                  loading={fieldTranslating.name_km}
                  label="From EN"
                  title="Translate from English to Khmer"
                />
              )}
            </div>
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
            <div className="flex items-center justify-between">
              <label className={label}>{t("categories.descEn")}</label>
              {form.description_km && (
                <FieldTranslateButton
                  onClick={() => handleTranslateSingleField("description_km", "description", "km", "en")}
                  loading={fieldTranslating.description}
                  label="From KM"
                  title="Translate from Khmer to English"
                />
              )}
            </div>
            <textarea
              className={input}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("categories.descEnPlaceholder")}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={label}>{t("categories.descKm")}</label>
              {form.description && (
                <FieldTranslateButton
                  onClick={() => handleTranslateSingleField("description", "description_km", "en", "km")}
                  loading={fieldTranslating.description_km}
                  label="From EN"
                  title="Translate from English to Khmer"
                />
              )}
            </div>
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
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving || translating}
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
