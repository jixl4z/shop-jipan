"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="flex flex-col rounded-2xl bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700/90 overflow-hidden transition-all duration-300 group glow-card">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative w-full aspect-video sm:aspect-[4/3] bg-neutral-950 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
            {product.badge}
          </div>
        )}

        {/* Stock Status Pill */}
        <div className="absolute bottom-3 right-3">
          {inStock ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>พร้อมส่ง ({product.stockCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-500/30 text-rose-300 text-[11px] font-medium backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>สินค้าหมด</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          {product.category && (
            <div className="text-[11px] font-medium text-neutral-400 mb-1">
              {product.category.name}
            </div>
          )}

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 font-light">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-neutral-400 leading-none">ราคาสินค้า</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                ฿{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through font-mono">
                  ฿{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => openBuyModal(product)}
            disabled={!inStock}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              inStock
                ? currentTheme.accent
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{inStock ? "สั่งซื้อ" : "หมด"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
