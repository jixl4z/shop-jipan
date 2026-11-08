"use client";

import React from "react";
import Link from "next/link";
import {
  Gamepad2,
  Tv,
  Key,
  Gift,
  Package,
  Tag,
  ChevronRight,
  Check,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount: number;
  bannerImage?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Gamepad2,
  Tv,
  Key,
  Gift,
  Package,
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
  return (
    <div className="w-full space-y-4">
      {/* Category Section Header (genzxshop reference style) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
              หมวดหมู่แนะนำ
            </h2>
            <span className="text-xs text-neutral-400 font-normal hidden sm:inline">
              Recommended Categories
            </span>
          </div>
        </div>

        {/* Gradient divider line */}
        <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-rose-500/30 via-rose-500/10 to-transparent mx-4" />

        <div className="flex items-center gap-2 shrink-0">
          {selectedSlug !== "all" && (
            <button
              onClick={() => onSelectCategory("all")}
              className="text-xs text-neutral-700 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/15 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>✕ ทั้งหมด</span>
            </button>
          )}
          <Link
            href="/categories"
            className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors font-semibold px-2 py-1"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Category Cards Grid (genzxshop reference 2-tier banner layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const isIconUrl =
            cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("/"));
          const Icon = (!isIconUrl && cat.icon && ICON_MAP[cat.icon]) || Package;
          const isSelected = selectedSlug === cat.slug;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? "all" : cat.slug)}
              className={`rounded-2xl glass-panel interactive-card p-3 sm:p-3.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 group shadow-lg ${
                isSelected
                  ? "border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/10 -translate-y-1 bg-rose-500/5 dark:bg-rose-500/10"
                  : "border-black/10 dark:border-white/[0.08] hover:border-black dark:hover:border-white"
              }`}
            >
              {/* Top Banner Graphic / Artwork */}
              <div className="relative aspect-[21/8] sm:aspect-[21/7] w-full rounded-xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-black/5 dark:border-white/10 shadow-inner">
                {cat.bannerImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cat.bannerImage}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  /* High-tech fallback banner with bold category identity */
                  <div className="w-full h-full relative flex items-center justify-between px-5 sm:px-6 bg-gradient-to-r from-red-950/80 via-neutral-900 to-black overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(244,63,94,0.22),transparent_65%)]" />
                    <div className="relative z-10 space-y-0.5">
                      <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-bold">
                        PRODUCT
                      </span>
                      <div className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">
                        {cat.name}
                      </div>
                      <span className="text-[11px] text-neutral-400 font-light block">
                        JIPAN STORE
                      </span>
                    </div>
                    <div className="relative z-10 opacity-25 group-hover:opacity-50 transition-opacity">
                      {isIconUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={cat.icon}
                          alt={cat.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <Icon className="w-14 h-14 sm:w-16 sm:h-16 text-rose-500 stroke-[1.2]" />
                      )}
                    </div>
                  </div>
                )}

                {/* Subtle bottom gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 z-10">
                    <Check className="w-3 h-3" />
                    <span>กำลังเลือก</span>
                  </div>
                )}
              </div>

              {/* Bottom Row: Category Name & Count (Left) + Arrow Icon (Right) */}
              <div className="flex items-center justify-between px-1">
                <div className="min-w-0 space-y-0.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white tracking-tight group-hover:text-rose-500 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                    {cat.productCount} สินค้าในหมวดหมู่นี้
                  </p>
                </div>

                {/* Action Arrow Button */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-slate-100 text-slate-600 group-hover:bg-rose-500 group-hover:text-white dark:bg-white/[0.05] dark:text-neutral-400 dark:group-hover:bg-rose-500 dark:group-hover:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
