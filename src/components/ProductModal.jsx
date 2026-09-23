import { useEffect, useState } from "react";
import { Upload, Star, Loader2, Clapperboard, Package } from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

const EMPTY = {
  name: "",
  name_km: "",
  description: "",
  description_km: "",
  price: "",
  original_price: "",
  stock: "",
  category: "",
  is_on_sale: false,
  sale_percent: 0,
  images: [],
  video_url: "",
  variants: [],
  rating: 5.0,
};

export default function ProductModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [variantInput, setVariantInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      // ទាញ Category ពី API មកដាក់ជា suggestions (ក្នុង <datalist>)
      api
        .getCategories()
        .then((cats) => setCategories(cats.map((c) => c.name)))
        .catch(() => setCategories([]));
      setForm(
        initial
          ? {
              name: initial.name,
              name_km: initial.name_km || "",
              description: initial.description || "",
              description_km: initial.description_km || "",
              price: initial.price,
              original_price:
                initial.original_price !== undefined && initial.original_price !== null
                  ? initial.original_price
                  : "",
              stock: initial.stock,
              category: initial.category || "",
              is_on_sale: initial.is_on_sale,
              sale_percent: initial.sale_percent || 0,
              rating:
                initial.rating !== undefined && initial.rating !== null
                  ? initial.rating
                  : 5.0,
              images:
                initial.images && initial.images.length
                  ? initial.images
                  : initial.image_url
                  ? [initial.image_url]
                  : [],
              video_url: initial.video_url || "",
              variants: Array.isArray(initial.variants) ? initial.variants : [],
            }
          : EMPTY
      );
      setVariantInput("");
      setError("");
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Upload រូបភាពពីកុំព្យូទ័រ (អាចជ្រើសរើសច្រើនសន្លឹកក្នុងពេលតែមួយ)
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = [];
      for (const f of files) {
        const res = await api.uploadImage(f);
        urls.push(res.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Upload វីដេអូផលិតផល (mp4 / webm / mov / ogg / m4v)
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError("");
    try {
      const res = await api.uploadImage(file, "video");
      set("video_url", res.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const removeVideo = () => set("video_url", "");

  // ធ្វើឱ្យរូបភាពក្លាយជារូបមេ (Main Image = រូបទី១)
  const makeMain = (idx) => {
    setForm((f) => {
      const imgs = [...f.images];
      const [it] = imgs.splice(idx, 1);
      imgs.unshift(it);
      return { ...f, images: imgs };
    });
  };

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addVariant = () => {
    const v = variantInput.trim();
    if (!v) return;
    if (!(form.variants || []).includes(v)) {
      setForm((f) => ({ ...f, variants: [...(f.variants || []), v] }));
    }
    setVariantInput("");
  };

  const removeVariant = (vToRemove) => {
    setForm((f) => ({
      ...f,
      variants: (f.variants || []).filter((v) => v !== vToRemove),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || form.price === "" || form.stock === "") {
      setError(t("products.requiredFields"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        name_km: (form.name_km || "").trim(),
        description: form.description.trim(),
        description_km: (form.description_km || "").trim(),
        price: parseFloat(form.price),
        original_price:
          form.original_price !== "" &&
          form.original_price !== null &&
          form.original_price !== undefined
            ? parseFloat(form.original_price)
            : null,
        stock: parseInt(form.stock, 10),
        category: form.category.trim(),
        is_on_sale: form.is_on_sale,
        sale_percent: form.is_on_sale ? parseFloat(form.sale_percent) || 0 : 0,
        rating: form.rating !== "" ? parseFloat(form.rating) || 5.0 : 5.0,
        image_url: form.images[0] || "",
        images: form.images,
        video_url: form.video_url || "",
        variants: form.variants || [],
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
      title={initial ? t("products.editProduct") : t("products.createProduct")}
      subtitle={initial ? t("products.editProductSub") : t("products.createProductSub")}
      icon={Package}
      maxWidth="2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Images: Main + supporting */}
        <div>
          <label className={label}>{t("products.productImagesLabel")}</label>
          <p className="text-xs text-slate-400 mt-0.5">{t("products.mainImageHint")}</p>

          {form.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.images.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5" />
                      {t("products.mainBadge")}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-around py-1">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeMain(i)}
                        className="text-[10px] text-white hover:text-pink-300 font-semibold"
                      >
                        {t("products.makeMain")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-[10px] text-rose-300 hover:text-rose-400"
                    >
                      {t("common.remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-pink-500 hover:text-pink-600 cursor-pointer transition">
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleUpload}
            />
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.uploading")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {t("products.uploadFromComputer")}
              </>
            )}
          </label>
        </div>

        {/* Video: វីដេអូផលិតផល (mp4 / webm / mov) — បង្ហាញលើទំព័រផលិតផល */}
        <div>
          <div className="flex items-center justify-between">
            <label className={label}>{t("products.productVideoFull")}</label>
            <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-200/80 dark:border-pink-800/80">
              ★ {t("products.videoFirstHint")}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t("products.videoHint")}</p>

          {form.video_url ? (
            <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 bg-black group">
              <video
                src={form.video_url}
                className="w-full max-h-56 object-contain"
                autoPlay
                muted
                loop
                controls
                playsInline
                preload="metadata"
              />
              <div className="absolute top-1.5 right-1.5 flex gap-1.5">
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                  <Clapperboard className="w-2.5 h-2.5" />
                  {t("products.productVideo")}
                </span>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded"
                >
                  {t("common.remove")}
                </button>
              </div>
            </div>
          ) : null}

          <label className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-pink-500 hover:text-pink-600 cursor-pointer transition">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v"
              hidden
              onChange={handleVideoUpload}
            />
            {uploadingVideo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("products.uploadingVideo")}
              </>
            ) : (
              <>
                <Clapperboard className="w-4 h-4" />
                {form.video_url ? t("products.replaceVideo") : t("products.uploadVideoFromComputer")}
              </>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("products.nameEn")}</label>
            <input
              className={input}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("products.nameEnPlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("products.nameKm")}</label>
            <input
              className={input}
              value={form.name_km || ""}
              onChange={(e) => set("name_km", e.target.value)}
              placeholder={t("products.nameKmPlaceholder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t("products.descEn")}</label>
            <textarea
              className={input}
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("products.descEnPlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("products.descKm")}</label>
            <textarea
              className={input}
              rows={2}
              value={form.description_km || ""}
              onChange={(e) => set("description_km", e.target.value)}
              placeholder={t("products.descKmPlaceholder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className={label}>{t("products.productPrice")} *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={input}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={label}>{t("products.originalPrice")} ($)</label>
              <span className="text-[10px] text-slate-400">
                {t("products.originalPriceHintShort")}
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              className={input}
              value={form.original_price}
              onChange={(e) => set("original_price", e.target.value)}
              placeholder={t("products.originalPricePlaceholder")}
            />
          </div>
          <div>
            <label className={label}>{t("products.productStock")} *</label>
            <input
              type="number"
              min="0"
              className={input}
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </div>
        </div>

        {/* Rating / Stars */}
        <div>
          <div className="flex items-center justify-between">
            <label className={`${label} flex items-center gap-1.5 text-amber-600 dark:text-amber-400`}>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {t("products.ratingStars")}
            </label>
            <span className="text-xs font-bold text-amber-500">
              ★ {Number(form.rating || 5.0).toFixed(1)}
            </span>
          </div>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className={input}
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            placeholder="5.0"
          />
        </div>

        {/* Quick Star Presets */}
        <div className="flex items-center gap-1.5 -mt-1 flex-wrap">
          <span className="text-slate-400 text-xs">{t("products.quickStar")}</span>
          {[5.0, 4.9, 4.8, 4.5, 4.0].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => set("rating", val)}
              className={`px-2 py-0.5 rounded-md font-semibold text-xs border transition ${
                Number(form.rating) === val
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
              }`}
            >
              ★ {val.toFixed(1)}
            </button>
          ))}
        </div>

        <div>
          <label className={label}>{t("common.category")}</label>
          <input
            list="product-categories"
            className={input}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder={t("products.categoryPlaceholder")}
          />
          <datalist id="product-categories">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {categories.length > 0 && (
            <p className="mt-1.5 text-xs text-slate-400">
              {t("products.categoryTip")}
            </p>
          )}
        </div>

        {/* Types / Variants (ជម្រើសប្រភេទ / ពណ៌ / ម៉ូត) */}
        <div>
          <label className={label}>{t("products.variantsLabel")}</label>
          <p className="text-xs text-slate-400 mt-0.5">{t("products.variantsHint")}</p>
          <div className="mt-1.5 flex gap-2">
            <input
              className={input}
              value={variantInput}
              onChange={(e) => setVariantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariant();
                }
              }}
              placeholder={t("products.variantsPlaceholder")}
            />
            <button
              type="button"
              onClick={addVariant}
              className="mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition shrink-0"
            >
              {t("common.add")}
            </button>
          </div>
          {form.variants && form.variants.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {form.variants.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-xs"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => removeVariant(v)}
                    className="w-4 h-4 rounded-full hover:bg-pink-200 dark:hover:bg-pink-800 flex items-center justify-center text-pink-800 dark:text-pink-200 text-sm font-bold ml-0.5"
                    title={t("products.removeVariant")}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_on_sale}
              onChange={(e) => set("is_on_sale", e.target.checked)}
              className="w-4 h-4 rounded accent-pink-600"
            />
            {t("products.saleLabel")}
          </label>
          {form.is_on_sale && (
            <div className="w-28">
              <label className={label}>{t("products.salePercent")}</label>
              <input
                type="number"
                min="0"
                max="100"
                className={input}
                value={form.sale_percent}
                onChange={(e) => set("sale_percent", e.target.value)}
              />
            </div>
          )}
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
            disabled={saving || uploading || uploadingVideo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-md shadow-pink-500/25 transition text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving
              ? t("common.saving")
              : initial
              ? t("products.saveChanges")
              : t("products.createProduct")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
