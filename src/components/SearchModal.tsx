"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ShoppingBag,
  Loader2,
  Sparkles,
  Tag,
  CreditCard,
  Star,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  badge?: string | null;
  stockCount?: number;
  soldCount?: number;
  isActive?: boolean;
  isSuspended?: boolean;
  category?: { name: string; slug?: string } | null;
  _count?: { stockItems: number };
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.products || [];
          setProducts(list);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = products.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.badge?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#0b0c10] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.08] bg-[#0e1017]">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า, บัตรเติมเงิน, ไอดีเกม, แอปพรีเมียม... (Ctrl + K)"
            className="w-full bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 border border-white/[0.08]"
          >
            ESC
          </button>
        </div>

        {/* Quick Nav Shortcuts when no search */}
        {!query && (
          <div className="px-4 py-3 border-b border-white/[0.06] bg-black/40">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>เมนูลัด (Quick Links)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Link
                href="/categories"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 text-neutral-300 hover:text-white transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium text-xs">หมวดหมู่</span>
              </Link>
              <Link
                href="/topup"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 text-neutral-300 hover:text-white transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium text-xs">เติมเงิน</span>
              </Link>
              <Link
                href="/reviews"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 text-neutral-300 hover:text-white transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium text-xs">รีวิวลูกค้า</span>
              </Link>
              <Link
                href="/support"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 text-neutral-300 hover:text-white transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium text-xs">ศูนย์เคลม</span>
              </Link>
            </div>
          </div>
        )}

        {/* Section title for items */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            {query ? (
              <>
                <span>ผลการค้นหาสำหรับ</span>
                <span className="text-white font-bold">&quot;{query}&quot;</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>สินค้าทั้งหมดในร้าน</span>
              </>
            )}
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            {filtered.length} รายการ
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span>กำลังโหลดรายการสินค้า...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center space-y-1">
              <p className="text-neutral-400 text-xs">
                {query ? `ไม่พบสินค้าที่ตรงกับ "${query}"` : "ไม่พบรายการสินค้าในระบบ"}
              </p>
              <p className="text-neutral-600 text-[11px]">
                ลองค้นหาด้วยคำอื่น เช่น ชื่อนก, บัตรเติมเงิน, แอป หรือไอดีเกม
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const stock = item.stockCount ?? item._count?.stockItems ?? 0;
              const inStock = stock > 0 && !item.isSuspended;
              const hasDiscount =
                item.originalPrice && item.originalPrice > item.price;

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.slug || item.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/15 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-rose-400 transition-colors">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                        {item.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">
                            {item.category.name}
                          </span>
                        )}
                        <span className="text-[11px] flex items-center gap-1 font-mono">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inStock ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"
                            }`}
                          />
                          <span className={inStock ? "text-emerald-400" : "text-neutral-500"}>
                            {inStock ? `พร้อมส่ง ${stock} ชิ้น` : "สินค้าหมด"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-white font-mono">
                        ฿{item.price.toFixed(2)}
                      </div>
                      {hasDiscount && (
                        <div className="text-[10px] text-neutral-500 line-through font-mono">
                          ฿{item.originalPrice!.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-rose-500 text-neutral-400 group-hover:text-white flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 sm:px-5 py-3 border-t border-white/[0.08] bg-black/60 text-[11px] text-neutral-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>กดเลือกสินค้าเพื่อดูรายละเอียดและสั่งซื้อทันที</span>
          </span>
          <span className="font-mono text-neutral-500">{filtered.length} รายการ</span>
        </div>
      </div>
    </div>
  );
}
