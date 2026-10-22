"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ShoppingCart, CheckCircle2, AlertCircle, Sparkles, Tag } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  stockCount: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const { openBuyModal, currentTheme } = useStore();
  const inStock = product.stockCount > 0;

  return (
    <div className="flex flex-col rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] hover:border-white/20 overflow-hidden transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 relative">
      
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative w-full aspect-[4/3] bg-[#07080c] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges (Best Seller / Custom) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge ? (
            <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-black text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black" />
              {product.badge}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-white/80 text-[10px] font-mono backdrop-blur-md">
              HOT ITEM
            </span>
          )}
        </div>

        {/* Stock Status Pill (Fluffy 4Tunez style) */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {inStock ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a1a12]/90 border border-emerald-500/40 text-emerald-400 text-[11px] font-medium backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>พร้อมขาย</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a0a0e]/90 border border-rose-500/40 text-rose-400 text-[11px] font-medium backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>สินค้าหมด</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          {product.category && (
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>{product.category.name}</span>
            </div>
          )}

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Stock remaining subtext */}
          <div className="mt-2 text-xs font-mono text-slate-400">
            {inStock ? (
              <span className="text-slate-400">
                สินค้าคงเหลือ <strong className="text-emerald-400 font-semibold">{product.stockCount}</strong> ชิ้น
              </span>
            ) : (
              <span className="text-rose-400/80">สินค้าหมดชั่วคราว</span>
            )}
          </div>
        </div>

        {/* Price & Full Width Buy Button (4Tunez style) */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-slate-400 font-light">ราคาสินค้า</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white tracking-tight">
                ฿{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  ฿{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Full-width Order Button */}
          <button
            onClick={() => openBuyModal(product)}
            disabled={!inStock}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
              inStock
                ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98] shadow-white/10 hover:shadow-lg"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{inStock ? "สั่งซื้อสินค้า" : "สินค้าหมด"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
