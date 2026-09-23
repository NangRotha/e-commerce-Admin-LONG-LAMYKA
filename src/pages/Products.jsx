import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Clapperboard,
  Filter,
  ArrowUpDown,
  Layers,
  Star,
  TrendingUp,
  DollarSign,
  Check,
} from "lucide-react";
import { api } from "../api/client";
import ProductModal from "../components/ProductModal";
import Modal from "../components/Modal";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

export default function Products() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null); // { id, value } — inline price edit
  const [savingPrice, setSavingPrice] = useState(false);

  // Bulk Price Adjust state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("All");
  const [bulkOperation, setBulkOperation] = useState("add_fixed"); // add_fixed | add_percent | sub_fixed | sub_percent
  const [bulkValue, setBulkValue] = useState("");
  const [bulkSetOriginalPrice, setBulkSetOriginalPrice] = useState(true);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMessage, setBulkMessage] = useState({ text: "", type: "" });

  const { t, lang } = useI18n();

  // name (EN) -> name_km  — សម្រាប់បង្ហាញឈ្មោះ Category តាមភាសាដែលកំពុងប្រើ
  const [catMap, setCatMap] = useState({});

  const load = useCallback(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
    api
      .getCategories()
      .then((list) =>
        setCatMap(
          Object.fromEntries((list || []).map((c) => [c.name, c.name_km || ""]))
        )
      )
      .catch(() => setCatMap({}));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: ផលិតផល ឬ Category ត្រូវបានបន្ថែម/កែ/លុប -> បញ្ជីបច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime(["products_changed", "categories_changed"], load);

  const categories = useMemo(() => {
    const list = [...new Set((products || []).map((p) => p.category).filter(Boolean))];
    return ["All", ...list.sort()];
  }, [products]);

  /** ឈ្មោះ/ពិពណ៌នាតាមភាសាដែលកំពុងប្រើ (មាន Fallback ទៅភាសាមួយទៀត) */
  const pickName = useCallback(
    (p) => (lang === "km" ? p.name_km || p.name : p.name || p.name_km) || "",
    [lang]
  );
  const pickDesc = useCallback(
    (p) =>
      (lang === "km"
        ? p.description_km || p.description
        : p.description || p.description_km) || "",
    [lang]
  );
  const otherName = useCallback(
    (p) => (lang === "km" ? p.name || "" : p.name_km || ""),
    [lang]
  );
  /** ឈ្មោះ Category តាមភាសា (value នៅតែជា name EN សម្រាប់ Filter API) */
  const catLabel = useCallback(
    (name) => {
      if (name === "All")
        return t("products.allCategories", { count: products?.length || 0 });
      const km = catMap[name];
      return lang === "km" ? km || name : name;
    },
    [catMap, lang, products, t]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (products || []).filter((p) => {
      const matchSearch =
        !q ||
        pickName(p).toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.name_km || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.description_km || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.variants || []).some((v) => v.toLowerCase().includes(q));
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    return list.sort((a, b) => {
      if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name);
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rating_desc") return (b.rating ?? 5.0) - (a.rating ?? 5.0);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;
      return (b.id || 0) - (a.id || 0); // newest
    });
  }, [products, search, selectedCategory, sortBy, pickName]);

  const handleSave = async (payload) => {
    if (editing) await api.updateProduct(editing.id, payload);
    else await api.createProduct(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    try {
      await api.deleteProduct(confirming.id);
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // Quick Price Edit in table
  const startPriceEdit = (p) => setEditingPrice({ id: p.id, value: String(p.price) });
  const cancelPriceEdit = () => setEditingPrice(null);

  const savePrice = async () => {
    if (!editingPrice) return;
    const price = parseFloat(editingPrice.value);
    if (Number.isNaN(price) || price < 0) {
      setError(t("products.invalidPrice"));
      setEditingPrice(null);
      return;
    }
    setSavingPrice(true);
    setError("");
    try {
      await api.updateProduct(editingPrice.id, { price });
      setEditingPrice(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingPrice(false);
    }
  };

  // Bulk adjustment calculations
  const targetBulkProducts = useMemo(() => {
    if (!products) return [];
    if (bulkCategory === "All") return products;
    return products.filter((p) => p.category === bulkCategory);
  }, [products, bulkCategory]);

  const sampleProduct = targetBulkProducts[0];
  const sampleCalculatedPrice = useMemo(() => {
    if (!sampleProduct) return null;
    const oldPrice = sampleProduct.price;
    const val = parseFloat(bulkValue);
    if (Number.isNaN(val) || val <= 0) return null;
    let newPrice = oldPrice;
    if (bulkOperation === "add_fixed") newPrice = oldPrice + val;
    else if (bulkOperation === "add_percent") newPrice = oldPrice + (oldPrice * val) / 100;
    else if (bulkOperation === "sub_fixed") newPrice = Math.max(0, oldPrice - val);
    else if (bulkOperation === "sub_percent") newPrice = Math.max(0, oldPrice - (oldPrice * val) / 100);
    return {
      name: sampleProduct.name,
      oldPrice,
      newPrice: Math.round(newPrice * 100) / 100,
      savedOriginal: bulkSetOriginalPrice ? oldPrice : null,
    };
  }, [sampleProduct, bulkValue, bulkOperation, bulkSetOriginalPrice]);

  const handleBulkSubmit = async (e) => {
    e?.preventDefault?.();
    const val = parseFloat(bulkValue);
    if (Number.isNaN(val) || val <= 0) {
      setBulkMessage({ text: t("products.bulkInvalidValue"), type: "error" });
      return;
    }
    setBulkSubmitting(true);
    setBulkMessage({ text: "", type: "" });
    try {
      const res = await api.bulkAdjustPrice({
        operation: bulkOperation,
        value: val,
        category: bulkCategory === "All" ? null : bulkCategory,
        set_original_price: bulkSetOriginalPrice,
      });
      setBulkMessage({
        text: t("products.bulkSuccess", { count: res.updated_count }),
        type: "success",
      });
      await load();
      setTimeout(() => {
        setBulkModalOpen(false);
        setBulkMessage({ text: "", type: "" });
      }, 1500);
    } catch (err) {
      setBulkMessage({ text: err.message, type: "error" });
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("products.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {products
                ? t("products.subtitle", { count: products.length })
                : t("products.subtitleLoading")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setBulkCategory(selectedCategory);
              setBulkValue("");
              setBulkMessage({ text: "", type: "" });
              setBulkModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-pink-200/70 dark:border-pink-900/60 bg-white dark:bg-[#181120] text-slate-700 dark:text-slate-200 font-bold hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-300 transition-all text-xs sm:text-sm shadow-2xs active:scale-95"
            title={t("products.bulkAdjustHint")}
          >
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <span>{t("products.bulkAdjust")}</span>
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold transition-all text-xs sm:text-sm shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t("products.addProduct")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="luxury-card rounded-[26px] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("products.searchPlaceholderFull")}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-pink-50/20 dark:bg-[#140d1a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-white dark:bg-[#181120] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {catLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-white dark:bg-[#181120] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 shadow-2xs"
              >
                <option value="newest">{t("products.sortNewestFirst")}</option>
                <option value="category">{t("products.sortByCategory")}</option>
                <option value="name">{t("products.sortNameFull")}</option>
                <option value="rating_desc">{t("products.sortRatingDesc")}</option>
                <option value="price_asc">{t("products.sortPriceAscFull")}</option>
                <option value="price_desc">{t("products.sortPriceDescFull")}</option>
                <option value="stock">{t("products.sortStockFull")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {products === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400">
          {t("products.noMatch")}
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">{t("products.thProduct")}</th>
                <th className="px-4 py-4 font-bold">{t("common.category")}</th>
                <th className="px-4 py-4 font-bold">{t("products.variants")}</th>
                <th className="px-4 py-4 font-bold">{t("products.rating")}</th>
                <th className="px-4 py-4 font-bold">{t("products.thPrice")}</th>
                <th className="px-4 py-4 font-bold">{t("products.thSale")}</th>
                <th className="px-4 py-4 font-bold">{t("common.stock")}</th>
                <th className="px-5 py-4 font-bold text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                          {pickName(p)}
                        </p>
                        <p
                          className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 truncate max-w-[220px]"
                          title={otherName(p) ? "" : t("products.noKhmerName")}
                        >
                          {otherName(p) || "—"}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[220px]">
                          {pickDesc(p) || "—"}
                        </p>
                        {p.video_url ? (
                          <span
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-1.5 py-0.5 rounded-md"
                            title={t("products.videoFirstHint")}
                          >
                            <Clapperboard className="w-2.5 h-2.5" />
                            VIDEO (1st)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.category || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {p.variants && p.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {p.variants.slice(0, 3).map((v, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60"
                          >
                            {v}
                          </span>
                        ))}
                        {p.variants.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{p.variants.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {Number(p.rating ?? 5.0).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {editingPrice?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-medium">$</span>
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingPrice.value}
                          onChange={(e) =>
                            setEditingPrice({ id: p.id, value: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePrice();
                            if (e.key === "Escape") cancelPriceEdit();
                          }}
                          onBlur={savePrice}
                          className="w-24 px-2 py-1 rounded-lg border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                        {savingPrice && (
                          <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start">
                        <button
                          type="button"
                          onClick={() => startPriceEdit(p)}
                          title={t("products.clickToEditPrice")}
                          className="font-bold text-pink-600 dark:text-pink-400 hover:underline underline-offset-2"
                        >
                          {formatPrice(p.price)}
                        </button>
                        {p.original_price && p.original_price > p.price && (
                          <span
                            className="text-[11px] text-slate-400 dark:text-slate-500 line-through"
                            title={`${t("products.originalPrice")}: ${formatPrice(p.original_price)}`}
                          >
                            {formatPrice(p.original_price)}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {p.is_on_sale ? (
                      <span className="text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full border border-rose-200/60 dark:border-rose-900">
                        -{Math.round(p.sale_percent)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        p.stock === 0
                          ? "text-rose-600 dark:text-rose-400"
                          : p.stock <= 5
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        aria-label={t("common.edit")}
                        title={t("products.editProduct")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(p)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        aria-label={t("common.delete")}
                        title={t("products.deleteProduct")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={t("products.deleteProduct")}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("products.confirmDelete")}{" "}
          <strong className="text-slate-900 dark:text-white">{confirming?.name}</strong>?{" "}
          {t("products.confirmDeleteDesc")}
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm shadow-xs"
          >
            {t("common.delete")}
          </button>
        </div>
      </Modal>

      {/* Bulk Price Adjustment Modal */}
      <Modal
        open={bulkModalOpen}
        onClose={() => {
          if (!bulkSubmitting) setBulkModalOpen(false);
        }}
        title={t("products.bulkAdjustTitle")}
        subtitle={t("products.bulkAdjustSubtitle")}
        icon={TrendingUp}
        maxWidth="xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {bulkMessage.text && (
            <p
              className={`text-sm rounded-xl px-4 py-3 border animate-fade-in ${
                bulkMessage.type === "success"
                  ? "text-pink-700 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800"
                  : "text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800"
              }`}
            >
              {bulkMessage.text}
            </p>
          )}

          {/* 1. Target Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("products.bulkCategory")}
            </label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 focus:outline-none"
            >
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? products?.length || 0
                    : (products || []).filter((p) => p.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat === "All"
                      ? t("products.allProductsCount", { count })
                      : t("products.categoryCount", {
                          name: catLabel(cat),
                          count,
                        })}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {t("products.bulkWillApply", { count: targetBulkProducts.length })}
            </p>
          </div>

          {/* 2. Adjustment Type / Operation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t("products.bulkOperationLabel")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "add_fixed", label: t("products.addFixed"), desc: t("products.addFixedDesc") },
                { id: "add_percent", label: t("products.addPercent"), desc: t("products.addPercentDesc") },
                { id: "sub_fixed", label: t("products.subFixed"), desc: t("products.subFixedDesc") },
                { id: "sub_percent", label: t("products.subPercent"), desc: t("products.subPercentDesc") },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setBulkOperation(op.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                    bulkOperation === op.id
                      ? "bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-800 dark:text-pink-300 ring-2 ring-pink-500/20"
                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="block font-bold text-xs sm:text-sm">{op.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Adjustment Value */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {bulkOperation.includes("percent")
                ? t("products.bulkValuePercent")
                : t("products.bulkValueFixed")}
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                step={bulkOperation.includes("percent") ? "1" : "0.01"}
                min="0.01"
                required
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={
                  bulkOperation.includes("percent")
                    ? t("products.bulkValuePlaceholderPercent")
                    : t("products.bulkValuePlaceholderFixed")
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 font-bold text-sm">
                {bulkOperation.includes("percent") ? "%" : "$"}
              </span>
            </div>
          </div>

          {/* 4. Keep Previous Price as Original Price (ឆ្នូតកាត់) */}
          <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <input
              id="set_original_price_check"
              type="checkbox"
              checked={bulkSetOriginalPrice}
              onChange={(e) => setBulkSetOriginalPrice(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-600"
            />
            <label htmlFor="set_original_price_check" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <strong className="text-slate-900 dark:text-white">{t("products.setOriginalPrice")}</strong>
              <p className="text-xs text-slate-400 mt-0.5">{t("products.setOriginalPriceHint")}</p>
            </label>
          </div>

          {/* 5. Live Calculation Preview */}
          {sampleCalculatedPrice && (
            <div className="rounded-xl p-3.5 bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-xs sm:text-sm space-y-1">
              <p className="font-bold text-pink-900 dark:text-pink-300 flex items-center gap-1.5">
                <span>{t("products.bulkPreviewTitle")}</span>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>{sampleCalculatedPrice.name}</strong>
              </p>
              <div className="flex items-center gap-2 pt-1 font-semibold flex-wrap">
                <span className="text-slate-500">
                  {t("products.oldPrice")} {formatPrice(sampleCalculatedPrice.oldPrice)}
                </span>
                <span>➔</span>
                <span className="text-pink-600 dark:text-pink-400 font-bold text-sm sm:text-base">
                  {t("products.newPrice")} {formatPrice(sampleCalculatedPrice.newPrice)}
                </span>
                {sampleCalculatedPrice.savedOriginal !== null && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ({formatPrice(sampleCalculatedPrice.savedOriginal)})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={bulkSubmitting}
              onClick={() => setBulkModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={bulkSubmitting || targetBulkProducts.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition text-sm shadow-md shadow-pink-500/25 disabled:opacity-60 cursor-pointer"
            >
              {bulkSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("products.applying")}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t("products.applyToCount", { count: targetBulkProducts.length })}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
