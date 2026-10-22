"use client";

import React, { useEffect, useState } from "react";
import { Layers, Plus, Edit, Trash2, Loader2, X } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CategoryItem | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Package");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (c: CategoryItem) => {
    setSelectedCat(c);
    setName(c.name);
    setSlug(c.slug);
    setIcon(c.icon || "Package");
    setDescription(c.description || "");
    setOrder(String(c.order ?? 0));
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, icon, description, order }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setName("");
        setSlug("");
        setDescription("");
        setOrder("0");
        await loadData();
      } else {
        alert("สร้างหมวดหมู่ไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCat.id,
          name,
          slug,
          icon,
          description,
          order,
        }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        await loadData();
      } else {
        alert("แก้ไขหมวดหมู่ไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`ต้องการลบหมวดหมู่ "${catName}" หรือไม่? (สินค้าในหมวดนี้จะถูกลบด้วย)`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) await loadData();
      else alert("ลบไม่สำเร็จ");
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            หมวดหมู่สินค้า (Categories)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            สร้าง แก้ไข และจัดเรียงหมวดหมู่สินค้าสำหรับจัดระเบียบหน้าร้านค้า
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setSlug("");
            setIcon("Package");
            setDescription("");
            setOrder("0");
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
              <th className="p-3.5 font-semibold">ลำดับ</th>
              <th className="p-3.5 font-semibold">ชื่อหมวดหมู่</th>
              <th className="p-3.5 font-semibold">Slug (URL)</th>
              <th className="p-3.5 font-semibold">ไอคอน</th>
              <th className="p-3.5 font-semibold">จำนวนสินค้า</th>
              <th className="p-3.5 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <span>กำลังโหลด...</span>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500">
                  ยังไม่มีหมวดหมู่
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-850/40">
                  <td className="p-3.5 font-mono text-neutral-400">#{c.order}</td>
                  <td className="p-3.5 font-semibold text-white">{c.name}</td>
                  <td className="p-3.5 font-mono text-neutral-400">{c.slug}</td>
                  <td className="p-3.5 text-neutral-300 font-mono">{c.icon || "Package"}</td>
                  <td className="p-3.5 font-mono font-semibold text-emerald-400">
                    {c._count?.products || 0} รายการ
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                        title="แก้ไขหมวดหมู่"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                        title="ลบหมวดหมู่"
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

      {/* Add Category Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h2 className="text-base font-bold text-white">เพิ่มหมวดหมู่ใหม่</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ไอดีเกมฮิต, บัตรเติมเงิน"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Slug (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="เช่น game-accounts"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">ลำดับการแสดงผล</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายหมวดหมู่..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {submitting ? "กำลังบันทึก..." : "ยืนยันการสร้างหมวดหมู่"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsEditOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h2 className="text-base font-bold text-white">แก้ไขหมวดหมู่: {selectedCat.name}</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">ลำดับการแสดงผล</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไขหมวดหมู่"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
