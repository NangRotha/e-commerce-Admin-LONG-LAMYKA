import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Clapperboard, Filter, ArrowUpDown, Layers } from "lucide-react";
import { api } from "../api/client";
import ProductModal from "../components/ProductModal";
import Modal from "../components/Modal";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";

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

  const load = useCallback(
    () =>
      api
        .getProducts()
        .then(setProducts)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: ផលិតផលត្រូវបានបន្ថែម/កែ/លុប -> បញ្ជីបច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("products_changed", load);

  const categories = useMemo(() => {
    const list = [...new Set((products || []).map((p) => p.category).filter(Boolean))];
    return ["All", ...list.sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (products || []).filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
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
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;
      return (b.id || 0) - (a.id || 0); // newest
    });
  }, [products, search, selectedCategory, sortBy]);

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
      setError("Please enter a valid price (0 or more).");
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

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {products ? `${products.length} products total` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or types..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter ("Order តាមប្រភេទ") */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? `All Categories (${products?.length || 0})` : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort / Order Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">Order: Newest first</option>
                <option value="category">Order: By Category (តាមប្រភេទ)</option>
                <option value="name">Order: Name (A-Z)</option>
                <option value="price_asc">Order: Price (Low → High)</option>
                <option value="price_desc">Order: Price (High → Low)</option>
                <option value="stock">Order: Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {products === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center text-slate-500 dark:text-slate-400">
          No products found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto shadow-xs">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 font-semibold">Product</th>
                <th className="px-4 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold">Variants / Types</th>
                <th className="px-4 py-3.5 font-semibold">Price</th>
                <th className="px-4 py-3.5 font-semibold">Sale</th>
                <th className="px-4 py-3.5 font-semibold">Stock</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
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
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[220px]">
                          {p.description || "—"}
                        </p>
                        {p.video_url ? (
                          <span
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-1.5 py-0.5 rounded-md"
                            title="Shows FIRST on storefront"
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
                          className="w-24 px-2 py-1 rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                        {savingPrice && (
                          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startPriceEdit(p)}
                        title="Click to edit price"
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                      >
                        {formatPrice(p.price)}
                      </button>
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
                        aria-label="Edit"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(p)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        aria-label="Delete"
                        title="Delete product"
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
        title="Delete product"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900 dark:text-white">{confirming?.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm shadow-xs"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
