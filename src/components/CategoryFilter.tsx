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
  selectedSlug?: string;
  onSelectCategory?: (slug: string) => void;
}) {
  return (
    <div className="w-full space-y-4">
      {/* Category Section Header (genzxshop reference style) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
              หมวดหมู่สินค้า
            </h2>
            <span className="text-xs text-neutral-400 font-normal hidden sm:inline">
              Recommended Categories
            </span>
          </div>
        </div>

        {/* Gradient divider line */}
        <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-white/20 via-white/5 to-transparent mx-4" />

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/categories"
            className="text-xs text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors font-semibold px-2 py-1"
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

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.slug);
              }}
              className="rounded-2xl bg-white dark:bg-[#0c0d12] interactive-card p-3 sm:p-3.5 border border-slate-200 dark:border-white/[0.08] hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 group shadow-md dark:shadow-lg"
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
                  <div className="w-full h-full relative flex items-center justify-between px-5 sm:px-6 bg-gradient-to-r from-neutral-900 via-[#111218] to-black overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(255,255,255,0.08),transparent_65%)]" />
                    <div className="relative z-10 space-y-0.5">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
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
                        <Icon className="w-14 h-14 sm:w-16 sm:h-16 text-neutral-400 stroke-[1.2]" />
                      )}
                    </div>
                  </div>
                )}

                {/* Subtle bottom gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Bottom Row: Category Name & Count (Left) + Arrow Icon (Right) */}
              <div className="flex items-center justify-between px-1">
                <div className="min-w-0 space-y-0.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                    {cat.productCount} สินค้าในหมวดหมู่นี้
                  </p>
                </div>

                {/* Action Arrow Button */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-black dark:bg-white/[0.05] dark:text-neutral-400 dark:group-hover:bg-white dark:group-hover:text-black border border-slate-200 dark:border-white/10">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
