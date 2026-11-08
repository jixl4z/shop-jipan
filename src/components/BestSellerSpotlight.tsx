"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Product } from "@/components/ProductCard";
import {
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  ChevronRight,
  Package,
} from "lucide-react";

export default function BestSellerSpotlight({ products }: { products: Product[] }) {
  // Find the top best-selling product with accurate values
  const bestSeller = useMemo(() => {
    if (!products || products.length === 0) return null;

    // 1. Sort by actual soldCount descending
    const sorted = [...products].sort(
      (a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)
    );

    // If top item has soldCount > 0, return it
    if ((sorted[0].soldCount ?? 0) > 0) return sorted[0];

    // 2. Otherwise pick product marked with BEST SELLER badge or HOT, or first product
    const marked = products.find(
      (p) =>
        p.badge?.toUpperCase().includes("BEST") ||
        p.badge?.toUpperCase().includes("HOT")
    );
    return marked || products[0];
  }, [products]);

  if (!bestSeller) return null;

  const soldCount = bestSeller.soldCount ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Card: BEST SELLER Spotlight Title & Total Stats */}
        <div className="md:col-span-5 lg:col-span-4 relative overflow-hidden rounded-2xl glass-panel interactive-card p-4 sm:p-5 border border-black/10 dark:border-white/[0.08] hover:border-black dark:hover:border-white flex flex-col justify-between shadow-lg min-h-[110px] sm:min-h-[120px]">
          {/* Subtle Watermark in background */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-black text-black/[0.03] dark:text-white/[0.04] pointer-events-none select-none tracking-tight flex items-center gap-1.5 pr-2">
            <span>ยอดนิยม</span>
            <span className="text-xl">🍭</span>
          </div>

          {/* Top: Badge + Title */}
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>BEST SELLER</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-snug">
              สินค้ายอดนิยม
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
              สินค้าขายดีที่คัดสรรมาเพื่อคุณ
            </p>
          </div>

          {/* Bottom Right: Real Sold Count */}
          <div className="relative z-10 self-end text-right pt-2">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-light">
              ขายแล้ว
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-neutral-900 dark:text-white tracking-tight leading-none">
              {soldCount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                ชิ้น
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: The Best-Selling Product Card */}
        <div className="md:col-span-7 lg:col-span-8 relative overflow-hidden rounded-2xl glass-panel interactive-card p-3.5 sm:p-4 border border-black/10 dark:border-white/[0.08] hover:border-black dark:hover:border-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
          {/* Product Thumbnail & Details */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* 3D Box Thumbnail */}
            <Link
              href={`/products/${bestSeller.slug}`}
              className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-neutral-900 border border-black/10 dark:border-white/10 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 block"
            >
              {bestSeller.image && !bestSeller.image.startsWith("/images/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={bestSeller.image}
                  alt={bestSeller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-black text-neutral-600">
                  <Package className="w-8 h-8 stroke-[1.2]" />
                </div>
              )}
            </Link>

            {/* Product Meta */}
            <div className="min-w-0 flex-1 space-y-1">
              <Link href={`/products/${bestSeller.slug}`} className="block">
                <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 group-hover:text-white transition-colors tracking-tight">
                  {bestSeller.name}
                </h4>
              </Link>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-neutral-400" />
                  <span>ขายแล้ว {soldCount.toLocaleString()}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <PackageCheck className="w-3 h-3 text-neutral-400" />
                  <span>คงเหลือ {bestSeller.stockCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Price & CTA Button */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 sm:gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06] shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-base sm:text-xl font-black font-mono text-white tracking-tight">
                ฿{bestSeller.price.toFixed(2)}
              </div>
              {bestSeller.originalPrice && bestSeller.originalPrice > bestSeller.price && (
                <div className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 line-through font-mono">
                  ฿{bestSeller.originalPrice.toFixed(2)}
                </div>
              )}
            </div>

            <Link
              href={`/products/${bestSeller.slug}`}
              className="px-4 py-2 sm:py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-all btn-shine shrink-0 cursor-pointer"
            >
              <span>ดูรายละเอียด</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
