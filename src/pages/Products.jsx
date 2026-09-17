import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Clapperboard } from "lucide-react";
import { api } from "../api/client";
import ProductModal from "../components/ProductModal";
import Modal from "../components/Modal";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";

export default function Products() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products || []).filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, search]);

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

  // កែតម្លៃភ្លាមៗក្នុងតារាង (Quick Price Edit) — ផ្ញើតែ price ប៉ុណ្ណោះ
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            {products ? `${products.length} products` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {products === null ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No products found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Sale</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
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
                        <p className="font-semibold text-slate-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[220px]">
                          {p.description || "—"}
                        </p>
                        {p.video_url ? (
                          <span
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded"
                            title="មានវីដេអូ (Has video)"
                          >
                            <Clapperboard className="w-2.5 h-2.5" />
                            VIDEO
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category || "—"}</td>
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
                          className="w-24 px-2 py-1 rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
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
                        className="font-semibold text-emerald-700 hover:underline underline-offset-2"
                      >
                        {formatPrice(p.price)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_on_sale ? (
                      <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                        -{Math.round(p.sale_percent)}%
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        p.stock === 0
                          ? "text-rose-600"
                          : p.stock <= 5
                          ? "text-amber-600"
                          : "text-slate-700"
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
                        className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirming(p)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        aria-label="Delete"
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
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">{confirming?.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
