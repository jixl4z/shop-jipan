"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, X, ShoppingBag, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  badge?: string | null;
  category?: { name: string } | null;
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
          if (data.products) setProducts(data.products);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
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
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า, บัตรเติมเงิน, ไอดีเกม, แอปพรีเมียม... (Ctrl + K)"
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Nav Shortcuts when no search */}
        {!query && (
          <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/40">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              เมนูลัด (Quick Links)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <Link
                href="/categories"
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>🏷️</span>
                <span className="truncate">หมวดหมู่</span>
              </Link>
              <Link
                href="/topup"
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>💳</span>
                <span className="truncate">เติมเงิน</span>
              </Link>
              <Link
                href="/reviews"
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>⭐</span>
                <span className="truncate">รีวิวลูกค้า</span>
              </Link>
              <Link
                href="/support"
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>🛡️</span>
                <span className="truncate">ศูนย์เคลม</span>
              </Link>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span>กำลังโหลดรายการสินค้า...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              ไม่พบสินค้าที่ตรงกับ &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const stockCount = item._count?.stockItems ?? 0;
              return (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700/80 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700/60 overflow-hidden shrink-0 flex items-center justify-center">
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
                      <div className="font-semibold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        {item.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                            {item.category.name}
                          </span>
                        )}
                        <span>
                          คงเหลือ: {stockCount > 0 ? `${stockCount} ชิ้น` : "หมด"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="font-bold text-sm text-white font-mono">
                      ฿{item.price.toFixed(2)}
                    </div>
                    {item.originalPrice && (
                      <div className="text-[11px] text-neutral-500 line-through">
                        ฿{item.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 text-[11px] text-neutral-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>กดเลือกสินค้าเพื่อดูรายละเอียดและสั่งซื้อทันที</span>
          </span>
          <span>{filtered.length} รายการ</span>
        </div>
      </div>
    </div>
  );
}
