"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Tv, Key, Gift, Package, Layers, ArrowUpRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Gamepad2,
  Tv,
  Key,
  Gift,
  Package,
};

const CAT_IMAGE_MAP: Record<string, string> = {
  "game-topup": "/images/cat-topup.webp",
  "premium-apps": "/images/cat-premium.webp",
  "game-accounts": "/images/cat-account.webp",
  "mystery-box": "/images/cat-random.webp",
};

export default function CategoryFilter({
  categories,
  selectedSlug,
  onSelectCategory,
}: {
  categories: Category[];
  selectedSlug: string;
  onSelectCategory: (slug: string) => void;
}) {
  const { currentTheme } = useStore();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-400" />
            <span>หมวดหมู่สินค้าทั้งหมด</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            เลือกดูสินค้าตามหมวดหมู่ หรือคลิกดูรายการทั้งหมด
          </p>
        </div>
        <Link
          href="/categories"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>ดูหน้ารวมหมวดหมู่</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {/* All Products Tab */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`group relative rounded-2xl border p-4 text-left transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[110px] ${
            selectedSlug === "all"
              ? `bg-neutral-800 ${currentTheme.borderActive} shadow-xl scale-[1.02]`
              : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">สินค้าทั้งหมด</div>
            <div className="text-[11px] text-neutral-400">ทุกหมวดหมู่</div>
          </div>
        </button>

        {/* Dynamic Category Cards */}
        {categories.map((cat) => {
          const Icon = (cat.icon && ICON_MAP[cat.icon]) || Package;
          const isSelected = selectedSlug === cat.slug;
          const imageSrc = CAT_IMAGE_MAP[cat.slug];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`group relative rounded-2xl border text-left transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? `bg-neutral-800 ${currentTheme.borderActive} shadow-xl scale-[1.02]`
                  : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850"
              }`}
            >
              {/* Optional Background Image */}
              {imageSrc && (
                <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
                </div>
              )}

              <div className="relative z-10 p-3.5 flex flex-col justify-between h-full w-full">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-white backdrop-blur-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800/90 border border-neutral-700 text-neutral-300">
                    {cat.productCount} ชิ้น
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 line-clamp-1">
                    {cat.description || "สินค้าดิจิทัลคุณภาพ"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
