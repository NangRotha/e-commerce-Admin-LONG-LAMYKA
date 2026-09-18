import { useEffect, useState } from "react";
import { Upload, Star, Loader2, Clapperboard, Package } from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";

const EMPTY = {
  name: "",
  description: "",
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
              description: initial.description || "",
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
      setError("Name, price and stock are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
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
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition";
  const label = "block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Product" : "Create Product"}
      subtitle={initial ? "Update product details and media" : "Add a new product to your catalog"}
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
          <label className={label}>Product images</label>
          <p className="text-xs text-slate-400 mt-0.5">
            The first image is the <strong>main image</strong>.
          </p>

          {form.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.images.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" />
                      MAIN
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-around py-1">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeMain(i)}
                        className="text-[10px] text-white hover:text-emerald-300"
                      >
                        Make main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-[10px] text-rose-300 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-400 text-sm font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition">
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
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload from computer
              </>
            )}
          </label>
        </div>

        {/* Video: វីដេអូផលិតផល (mp4 / webm / mov) — បង្ហាញលើទំព័រផលិតផល */}
        <div>
          <div className="flex items-center justify-between">
            <label className={label}>Product video</label>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
              ★ Shows FIRST on Storefront
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Optional — when added, this video will be displayed <strong>first before images</strong> on the storefront.
          </p>

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
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Clapperboard className="w-2.5 h-2.5" />
                  VIDEO
                </span>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}

          <label className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-400 text-sm font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v"
              hidden
              onChange={handleVideoUpload}
            />
            {uploadingVideo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading video...
              </>
            ) : (
              <>
                <Clapperboard className="w-4 h-4" />
                {form.video_url ? "Replace video" : "Upload video from computer"}
              </>
            )}
          </label>
        </div>

        <div>
          <label className={label}>Name *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Product name"
          />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea
            className={input}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short description"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className={label}>Price ($) *</label>
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
              <label className={label}>Original Price ($)</label>
              <span className="text-[10px] text-slate-400">តម្លៃចាស់</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              className={input}
              value={form.original_price}
              onChange={(e) => set("original_price", e.target.value)}
              placeholder="e.g. 25.00"
            />
          </div>
          <div>
            <label className={label}>Stock *</label>
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
              Rating / Stars
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
          <span className="text-slate-400 text-xs">Quick Star:</span>
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
          <label className={label}>Category</label>
          <input
            list="product-categories"
            className={input}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="e.g. Electronics"
          />
          <datalist id="product-categories">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {categories.length > 0 && (
            <p className="mt-1.5 text-xs text-slate-400">
              Tip: pick from the categories managed in the Categories page.
            </p>
          )}
        </div>

        {/* Types / Variants (ជម្រើសប្រភេទ / ពណ៌ / ម៉ូត) */}
        <div>
          <label className={label}>
            Product Types / Variants (ជម្រើសប្រភេទ / ពណ៌ / ម៉ូត)
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Allow customers to order by specific type or color (e.g. Pink, Black, White, Medium, Large).
          </p>
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
              placeholder="Type variant name (e.g. Pink) and press Enter or Add"
            />
            <button
              type="button"
              onClick={addVariant}
              className="mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition shrink-0"
            >
              Add
            </button>
          </div>
          {form.variants && form.variants.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {form.variants.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => removeVariant(v)}
                    className="w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-200 text-sm font-bold ml-0.5"
                    title="Remove variant"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_on_sale}
              onChange={(e) => set("is_on_sale", e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
            On sale
          </label>
          {form.is_on_sale && (
            <div className="w-28">
              <label className={label}>Sale %</label>
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

        <div className="pt-2 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading || uploadingVideo}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
