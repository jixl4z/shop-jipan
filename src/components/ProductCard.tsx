"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Package, PackageX, Ban, ChevronRight, Droplets, Sparkles } from "lucide-react";

export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  order?: number;
  stockCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  badge?: string | null;
  isActive?: boolean;
  isSuspended?: boolean;
  isRecommended?: boolean;
  hasVariants?: boolean;
  options?: ProductOptionItem[];
  stockCount: number;
  soldCount?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { openBuyModal } = useStore();

  const isSuspended = product.isSuspended === true || product.isActive === false;
  const inStock = product.stockCount > 0 && !isSuspended;
  const hasDiscount =
    product.originalPrice &&
    product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl bg-[#0b0c10] border border-white/[0.08] hover:border-white/20 p-3 sm:p-3.5 shadow-lg group relative overflow-hidden transition-all duration-300">
      {/* Product Image Area */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-white/[0.05]"
      >
        {/* Main image */}
        {product.image && !product.image.startsWith("/images/") ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              isSuspended
                ? "opacity-40 grayscale"
                : !inStock
                ? "opacity-55"
                : "opacity-100"
            }`}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-600 ${
              isSuspended
                ? "opacity-40 grayscale"
                : !inStock
                ? "opacity-55"
                : "opacity-100"
            }`}
          >
            <Package className="w-10 h-10 stroke-[1.2]" />
            <span className="text-[10px] font-mono mt-2 tracking-widest text-neutral-500 uppercase">
              JIPAN GOODS
            </span>
          </div>
        )}

        {/* Top Badges (e.g. ยอดนิยม or custom badge) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div>
            {product.isRecommended || product.badge === "ยอดนิยม" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black shadow-md">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>ยอดนิยม</span>
              </span>
            ) : product.badge ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/25 text-[10px] font-bold shadow-md">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>{product.badge}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Center Floating Status Overlays (สินค้าหมด / ปิดขายชั่วคราว) */}
        {isSuspended ? (
          <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none z-10">
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white mb-1">
                <Ban className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-xs">ปิดขาย</span>
              <span className="text-neutral-400 text-[10px] font-light mt-0.5">
                ปิดชั่วคราว
              </span>
            </div>
          </div>
        ) : !inStock ? (
          <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none z-10">
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white mb-1">
                <PackageX className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-xs">สินค้าหมด</span>
              <span className="text-neutral-400 text-[10px] font-light mt-0.5">
                รอเติมสต็อก
              </span>
            </div>
          </div>
        ) : null}
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between pt-2.5">
        <div>
          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-neutral-300 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Price & Discount Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
            <span className="text-white font-extrabold text-sm sm:text-base font-mono">
              ฿{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-neutral-500 line-through text-xs font-mono">
                  ฿{product.originalPrice!.toFixed(2)}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-neutral-200 text-[10px] font-bold">
                  ลด {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock remaining & Sold count */}
          <div className="text-[11px] text-neutral-400 font-light flex items-center gap-1.5 mt-0.5">
            <span>
              คงเหลือ <strong className="text-white font-mono">{product.stockCount}</strong>
            </span>
            <span className="text-neutral-600">|</span>
            <span>
              ขายแล้ว <strong className="text-neutral-300 font-mono">{product.soldCount ?? 0}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        {isSuspended ? (
          <button
            type="button"
            disabled
            className="w-full mt-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-neutral-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>ปิดขายชั่วคราว</span>
          </button>
        ) : !inStock ? (
          <button
            type="button"
            disabled
            className="w-full mt-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-neutral-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
          >
            <PackageX className="w-3.5 h-3.5" />
            <span>สินค้าหมด</span>
          </button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="w-full mt-3 py-2 sm:py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>รายละเอียด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
