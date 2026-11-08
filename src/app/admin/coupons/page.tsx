"use client";

import React, { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  AlertCircle,
  Tag,
  DollarSign,
  Percent,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  productId?: string | null;
  productName?: string | null;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

interface ProductSimple {
  id: string;
  name: string;
}

export default function AdminCouponsPage() {
  const { addToast } = useStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ProductSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinSpend, setFormMinSpend] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch {
      addToast("ดึงข้อมูลคูปองไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch {}
  };

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormTitle("ลดพิเศษ 10%");
    setFormDescription("");
    setFormDiscountType("PERCENT");
    setFormDiscountValue("10");
    setFormMinSpend("0");
    setFormMaxDiscount("");
    setFormUsageLimit("");
    setFormProductId("");
    setFormExpiresAt("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormTitle(c.title);
    setFormDescription(c.description || "");
    setFormDiscountType(c.discountType);
    setFormDiscountValue(c.discountValue.toString());
    setFormMinSpend(c.minSpend.toString());
    setFormMaxDiscount(c.maxDiscount ? c.maxDiscount.toString() : "");
    setFormUsageLimit(c.usageLimit ? c.usageLimit.toString() : "");
    setFormProductId(c.productId || "");
    setFormExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : "");
    setFormIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim() || !formDiscountValue) {
      addToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formCode.trim().toUpperCase(),
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minSpend: Number(formMinSpend) || 0,
        maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : null,
        usageLimit: formUsageLimit ? Number(formUsageLimit) : null,
        productId: formProductId.trim() || null,
        expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        isActive: formIsActive,
      };

      if (editingCoupon) {
        const res = await fetch("/api/admin/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCoupon.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          addToast(data.error || "แก้ไขคูปองไม่สำเร็จ", "error");
          return;
        }
        addToast("บันทึกการแก้ไขคูปองสำเร็จ", "success");
      } else {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          addToast(data.error || "สร้างคูปองไม่สำเร็จ", "error");
          return;
        }
        addToast("สร้างคูปองส่วนลดใหม่สำเร็จ", "success");
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch {
      addToast("เกิดข้อผิดพลาดในการบันทึก", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคูปอง "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast(`ลบคูปอง "${code}" เรียบร้อยแล้ว`, "success");
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        addToast("ลบคูปองไม่สำเร็จ", "error");
      }
    } catch {
      addToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        );
        addToast(
          `สลับสถานะคูปองเป็น ${!coupon.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"} สำเร็จ`,
          "success"
        );
      }
    } catch {
      addToast("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ", "error");
    }
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-sky-400" />
            <span>จัดการคูปองส่วนลด (Coupons)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            สร้างและจัดการโค้ดส่วนลดแบบเปอร์เซ็นต์หรือจำนวนเงิน กำหนดยอดขั้นต่ำและสิทธิ์ใช้งาน
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0090ff] hover:bg-[#0077e6] text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างคูปองใหม่</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสคูปอง หรือชื่อคูปอง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
          />
        </div>
      </div>

      {/* Coupons Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span>กำลังโหลดข้อมูลคูปอง...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 text-center space-y-3">
          <Ticket className="w-12 h-12 text-neutral-600 mx-auto" />
          <div className="text-sm font-bold text-white">ยังไม่มีคูปองส่วนลด</div>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            กดปุ่ม &quot;สร้างคูปองใหม่&quot; ด้านบนเพื่อเพิ่มโค้ดโปรโมชั่นสำหรับลูกค้าของคุณ
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-medium">
                <tr>
                  <th className="py-3 px-4">รหัสคูปอง (Code)</th>
                  <th className="py-3 px-4">ชื่อคูปอง</th>
                  <th className="py-3 px-4">ส่วนลด</th>
                  <th className="py-3 px-4">เงื่อนไข</th>
                  <th className="py-3 px-4">การใช้งาน</th>
                  <th className="py-3 px-4">เป้าหมาย</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filtered.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const isLimitReached = c.usageLimit !== null && c.usedCount >= c.usageLimit;

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                        <span className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20">
                          {c.code}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div>{c.title}</div>
                        {c.description && (
                          <div className="text-[11px] text-neutral-400 truncate max-w-xs mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-400">
                          {c.discountType === "PERCENT"
                            ? `ลด ${c.discountValue}%`
                            : `ลด ฿${c.discountValue.toFixed(2)}`}
                        </span>
                        {c.discountType === "PERCENT" && c.maxDiscount && (
                          <div className="text-[10px] text-neutral-400">
                            สูงสุด ฿{c.maxDiscount}
                          </div>
                        )}
                      </td>

                      {/* Condition / Min spend */}
                      <td className="py-3.5 px-4 text-neutral-300">
                        {c.minSpend > 0 ? `ขั้นต่ำ ฿${c.minSpend}` : "ไม่มีขั้นต่ำ"}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4 text-neutral-300 font-mono">
                        {c.usedCount} / {c.usageLimit !== null ? c.usageLimit : "∞"}
                        {isLimitReached && (
                          <span className="ml-1 text-[10px] text-rose-400 font-sans block">
                            (เต็มสิทธิ์แล้ว)
                          </span>
                        )}
                      </td>

                      {/* Target product */}
                      <td className="py-3.5 px-4 text-neutral-400">
                        {c.productName ? (
                          <span className="text-neutral-200 truncate max-w-[140px] block">
                            {c.productName}
                          </span>
                        ) : (
                          <span className="text-neutral-500">ทุกสินค้า</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium">
                            หมดอายุ
                          </span>
                        ) : c.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            เปิดใช้งาน
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-medium hover:bg-neutral-700 transition-colors cursor-pointer"
                          >
                            ปิดใช้งาน
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="แก้ไขคูปอง"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="ลบคูปอง"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-5 shadow-2xl text-left z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  {editingCoupon ? `แก้ไขคูปอง "${editingCoupon.code}"` : "สร้างคูปองส่วนลดใหม่"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    รหัสคูปอง (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="เช่น WELCOME10, VIP50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ชื่อแสดงผล (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="เช่น ลดพิเศษ 10%"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  คำอธิบายเพิ่มเติม
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="เช่น ส่วนลดพิเศษสำหรับสมาชิกใหม่"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ประเภทส่วนลด *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                    <option value="FIXED">จำนวนเงินคงที่ (บาท)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    มูลค่าส่วนลด *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    placeholder={formDiscountType === "PERCENT" ? "10 (คือ 10%)" : "50 (คือ 50 บาท)"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ยอดสั่งซื้อขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(e.target.value)}
                    placeholder="0 = ไม่มีขั้นต่ำ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ลดได้สูงสุด (บาท, สำหรับ %)
                  </label>
                  <input
                    type="number"
                    step="any"
                    disabled={formDiscountType !== "PERCENT"}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="ว่างไว้ = ไม่จำกัด"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    จำกัดสิทธิ์ใช้งาน (ครั้ง)
                  </label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="ว่างไว้ = ไม่จำกัดสิทธิ์"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    วันหมดอายุ (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ผูกเฉพาะสินค้า (Optional)
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">-- ใช้ได้กับทุกสินค้าในร้าน --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950 text-sky-500"
                  />
                  <span className="text-neutral-200 font-medium">เปิดใช้งานคูปองนี้ (Active)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#0090ff] hover:bg-[#0077e6] text-white font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer mt-4"
              >
                {submitting ? "กำลังบันทึกข้อมูล..." : editingCoupon ? "บันทึกการแก้ไข" : "สร้างคูปอง"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
