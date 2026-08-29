import { useEffect, useState } from "react";
import { Upload, Star, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { api } from "../api/client";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  is_on_sale: false,
  sale_percent: 0,
  images: [],
};

export default function ProductModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
              stock: initial.stock,
              category: initial.category || "",
              is_on_sale: initial.is_on_sale,
              sale_percent: initial.sale_percent || 0,
              images:
                initial.images && initial.images.length
                  ? initial.images
                  : initial.image_url
                  ? [initial.image_url]
                  : [],
            }
          : EMPTY
      );
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
        stock: parseInt(form.stock, 10),
        category: form.category.trim(),
        is_on_sale: form.is_on_sale,
        sale_percent: form.is_on_sale ? parseFloat(form.sale_percent) || 0 : 0,
        image_url: form.images[0] || "",
        images: form.images,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
  const label = "block text-sm font-medium text-slate-700";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Product" : "Add Product"}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={input}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
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
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
