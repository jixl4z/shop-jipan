"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ShoppingCart, Sparkles, Tag, Package } from "lucide-react";

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
  const { openBuyModal } = useStore();
  const inStock = product.stockCount > 0;

  return (
    <div className="flex flex-col rounded-2xl glass-panel interactive-card overflow-hidden group relative border border-white/[0.08]">
      
      {/* Product Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative w-full aspect-[16/10] bg-[#07080a] overflow-hidden"
      >
        {product.image && !product.image.startsWith("/images/") ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-600 group-hover:text-neutral-400 transition-colors">
            <Package className="w-10 h-10 stroke-[1.2]" />
            <span className="text-[10px] font-mono mt-2 tracking-widest text-neutral-500 uppercase">JIPAN GOODS</span>
          </div>
        )}

        {/* Top Badges (Monochrome Contrast) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {product.badge ? (
            <span className="px-2.5 py-0.5 rounded-md bg-white text-black text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black" />
              <span>{product.badge}</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-black/80 border border-white/20 text-white text-[10px] font-mono backdrop-blur-md">
              HOT ITEM
            </span>
          )}
        </div>

        {/* Stock Status Pill (Monochrome Glass) */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {inStock ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/30 text-white text-[11px] font-medium backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>พร้อมขาย</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-neutral-750 text-neutral-400 text-[11px] font-medium backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-neutral-500" />
              <span>สินค้าหมด</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category Tag */}
          {product.category && (
            <div className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-neutral-500" />
              <span>{product.category.name}</span>
            </div>
          )}

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-neutral-200 line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Stock remaining info */}
          <div className="mt-2 text-xs font-mono text-neutral-400 flex items-center gap-1.5">
            {inStock ? (
              <span>
                คงเหลือ <strong className="text-white font-semibold">{product.stockCount}</strong> ชิ้น
              </span>
            ) : (
              <span className="text-neutral-500">สินค้าหมดชั่วคราว</span>
            )}
          </div>
        </div>

        {/* Price & CTA Button */}
        <div className="pt-3 border-t border-white/[0.08] space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-neutral-400 font-light">ราคาสินค้า</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white tracking-tight">
                ฿{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through font-mono">
                  ฿{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Order Button (High-Contrast Monochrome) */}
          <button
            onClick={() => openBuyModal(product)}
            disabled={!inStock}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer ${
              inStock
                ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98] btn-shine"
                : "bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800"
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
