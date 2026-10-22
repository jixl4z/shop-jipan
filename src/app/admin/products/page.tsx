"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Star,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  isActive: boolean;
  isRecommended: boolean;
  categoryId: string;
  stockCount: number;
  category?: { name: string };
}

interface CategoryItem {
  id: string;
  name: string;
}

interface StockRecord {
  id: string;
  content: string;
  isUsed: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsRecommended, setFormIsRecommended] = useState(false);
  const [formInitialStock, setFormInitialStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Stock Form state
  const [rawStockInput, setRawStockInput] = useState("");
  const [stockItems, setStockItems] = useState<StockRecord[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (!prodRes.ok) {
        const prodErr = await prodRes.json().catch(() => ({}));
        setFeedback({
          msg: prodErr.error || `เซสชันแอดมินไม่ถูกต้อง หรือไม่สามารถดึงข้อมูลได้ (HTTP ${prodRes.status})`,
          type: "error",
        });
        return;
      }
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !formCategoryId) {
          setFormCategoryId(catData.categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setFeedback({ msg: "ไม่สามารถเชื่อมต่อฐานข้อมูลสินค้าได้", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadProductStock = async (productId: string) => {
    setLoadingStock(true);
    try {
      const res = await fetch(`/api/admin/stock?productId=${productId}`);
      const data = await res.json();
      if (data.stockItems) setStockItems(data.stockItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStock(false);
    }
  };

  const openEditModal = (prod: ProductItem) => {
    setSelectedProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(prod.categoryId);
    setFormPrice(String(prod.price));
    setFormOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : "");
    setFormImage(prod.image || "");
    setFormBadge(prod.badge || "");
    setFormDesc(prod.description || "");
    setFormIsActive(prod.isActive);
    setFormIsRecommended(prod.isRecommended);
    setFeedback(null);
    setIsEditOpen(true);
  };

  const openStockModal = (prod: ProductItem) => {
    setSelectedProduct(prod);
    setRawStockInput("");
    setIsStockOpen(true);
    loadProductStock(prod.id);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          categoryId: formCategoryId,
          price: formPrice,
          originalPrice: formOriginalPrice,
          image: formImage,
          badge: formBadge,
          description: formDesc,
          isRecommended: formIsRecommended,
          initialStock: formInitialStock,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ msg: data.error || "เกิดข้อผิดพลาด", type: "error" });
        return;
      }

      setIsAddOpen(false);
      setFormName("");
      setFormPrice("");
      setFormOriginalPrice("");
      setFormImage("");
      setFormBadge("");
      setFormDesc("");
      setFormIsRecommended(false);
      setFormInitialStock("");
      await loadData();
    } catch {
      setFeedback({ msg: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProduct.id,
          name: formName,
          categoryId: formCategoryId,
          price: formPrice,
          originalPrice: formOriginalPrice,
          image: formImage,
          badge: formBadge || null,
          description: formDesc,
          isActive: formIsActive,
          isRecommended: formIsRecommended,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ msg: data.error || "แก้ไขไม่สำเร็จ", type: "error" });
        return;
      }

      setIsEditOpen(false);
      await loadData();
    } catch {
      setFeedback({ msg: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !rawStockInput.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rawStock: rawStockInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เติมสต็อกไม่สำเร็จ");
        return;
      }

      setRawStockInput("");
      await Promise.all([loadProductStock(selectedProduct.id), loadData()]);
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStockItem = async (stockId: string) => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/admin/stock?id=${stockId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await Promise.all([loadProductStock(selectedProduct.id), loadData()]);
      }
    } catch {
      alert("ลบสต็อกไม่สำเร็จ");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        alert("ลบสินค้าไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const unusedStocks = stockItems.filter((s) => !s.isUsed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            จัดการสินค้า & สต็อกดิจิทัล
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            เพิ่ม แก้ไขราคา/รูปภาพ และจัดการสต็อกรหัส/คีย์/ไอดี พร้อมแจกให้ลูกค้าอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setFormName("");
            setFormPrice("");
            setFormOriginalPrice("");
            setFormImage("");
            setFormBadge("");
            setFormDesc("");
            setFormIsRecommended(false);
            setFormInitialStock("");
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้าตามชื่อ..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      {/* Product List Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <th className="p-3.5 font-semibold">สินค้า</th>
                <th className="p-3.5 font-semibold">หมวดหมู่</th>
                <th className="p-3.5 font-semibold">ราคา</th>
                <th className="p-3.5 font-semibold">สถานะ</th>
                <th className="p-3.5 font-semibold">สต็อกคงเหลือ</th>
                <th className="p-3.5 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                    <span>กำลังโหลดข้อมูลสินค้า...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    ไม่พบรายการสินค้า
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-850/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {prod.image && !prod.image.startsWith("/images/") ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-11 h-11 rounded-lg object-cover border border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            {prod.isRecommended && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          {prod.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold uppercase">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-300">
                      {prod.category?.name || "-"}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      ฿{prod.price.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {prod.isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          เปิดขาย
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-semibold">
                          ปิดชั่วคราว
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          prod.stockCount > 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {prod.stockCount} ชิ้น
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openStockModal(prod)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>สต็อก</span>
                        </button>
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                          title="แก้ไขสินค้า"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <h2 className="text-lg font-bold text-white">เพิ่มสินค้าใหม่</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs">
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น Premium ดูหนัง 30 วัน (จอส่วนตัว)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ป้ายกำกับ (Badge)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="เช่น HOT, BEST SELLER"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ราคาขาย (บาท) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="89.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ราคาเต็ม (สำหรับขีดฆ่า)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="150.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  URL รูปภาพสินค้า (เช่น https://images.unsplash.com/... หรือ ปล่อยว่าง)
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับสินค้า..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsRecommended}
                  onChange={(e) => setFormIsRecommended(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-950"
                />
                <span className="text-neutral-300">แสดงในหมวดหมู่ &quot;สินค้าแนะนำ&quot; หน้าแรก</span>
              </label>

              {/* Initial Stock Keys */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ใส่สต็อกสินค้าดิจิทัลเริ่มต้น (1 บรรทัด = 1 ชิ้น)
                </label>
                <textarea
                  rows={4}
                  value={formInitialStock}
                  onChange={(e) => setFormInitialStock(e.target.value)}
                  placeholder={"USER: account1 | PASS: 123456\nUSER: account2 | PASS: 654321\nKEY-ABCD-8891"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono focus:outline-none focus:border-neutral-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer mt-4"
              >
                {submitting ? "กำลังบันทึก..." : "ยืนยันการเพิ่มสินค้า"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsEditOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <h2 className="text-lg font-bold text-white">แก้ไขสินค้า: {selectedProduct.name}</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs">
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ป้ายกำกับ (Badge)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="เช่น HOT, BEST SELLER"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ราคาขาย (บาท) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ราคาเต็ม (สำหรับขีดฆ่า)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  URL รูปภาพสินค้า
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950"
                  />
                  <span className="text-neutral-300">เปิดจำหน่าย (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsRecommended}
                    onChange={(e) => setFormIsRecommended(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950"
                  />
                  <span className="text-neutral-300">สินค้าแนะนำ (Recommended)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer mt-4"
              >
                {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไขสินค้า"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage & Add Stock Modal */}
      {isStockOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsStockOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>จัดการสต็อกสินค้าดิจิทัล</span>
                </h2>
                <p className="text-xs text-neutral-400 truncate max-w-md mt-0.5">
                  สินค้า: <span className="text-white font-medium">{selectedProduct.name}</span> (พร้อมขาย{" "}
                  <span className="text-emerald-400 font-bold">{unusedStocks.length}</span> ชิ้น)
                </p>
              </div>
              <button
                onClick={() => setIsStockOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Stock Form */}
            <form onSubmit={handleAddStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  ➕ เพิ่มสต็อกใหม่ (วางข้อมูล 1 บรรทัด = 1 ชิ้น):
                </label>
                <textarea
                  rows={5}
                  required
                  value={rawStockInput}
                  onChange={(e) => setRawStockInput(e.target.value)}
                  placeholder={"KEY-8819-ABCDE\nKEY-8820-FGHIJ\nUSER: demo@vip.com | PASS: pass123"}
                  className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  จำนวนที่กำลังจะเพิ่ม:{" "}
                  <strong className="text-white font-mono">
                    {
                      rawStockInput
                        .split("\n")
                        .map((l) => l.trim())
                        .filter((l) => l.length > 0).length
                    }{" "}
                    ชิ้น
                  </strong>
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  {submitting ? "กำลังเพิ่มสต็อก..." : "ยืนยันการเพิ่มสต็อก"}
                </button>
              </div>
            </form>

            {/* Existing Unused Stock List */}
            <div className="pt-4 border-t border-neutral-800 space-y-2.5 text-xs">
              <div className="font-semibold text-neutral-300">
                📦 รายการรหัส/คีย์ที่อยู่ในคลังพร้อมขาย ({unusedStocks.length} ชิ้น):
              </div>

              {loadingStock ? (
                <div className="py-6 text-center text-neutral-500">กำลังโหลดรายการสต็อก...</div>
              ) : unusedStocks.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 text-center text-neutral-500">
                  ไม่มีสต็อกคงเหลือสำหรับสินค้านี้
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {unusedStocks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800/90"
                    >
                      <code className="text-emerald-400 font-mono text-[11px] truncate">
                        {st.content}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleDeleteStockItem(st.id)}
                        className="p-1 rounded-lg hover:bg-rose-950 text-neutral-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                        title="ลบรหัสชิ้นนี้ออกจากคลัง"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
