"use client";

import React from "react";
import Link from "next/link";
import {
  Gamepad2,
  Tv,
  Key,
  Gift,
  Package,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

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
      {/* Category Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              หมวดหมู่สินค้า
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1">
              คลิกการ์ดเพื่อกรองสินค้าทันที
            </p>
          </div>
        </div>

        <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-white/20 via-white/5 to-transparent mx-3" />

        <div className="flex items-center gap-2 shrink-0">
          {selectedSlug !== "all" && (
            <button
              onClick={() => onSelectCategory("all")}
              className="text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>✕ ทั้งหมด</span>
            </button>
          )}
          <Link
            href="/categories"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors font-medium px-2 py-1"
          >
            <span>ดูหน้าหมวดหมู่ทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Symmetrical Well-Proportioned Category Cards Grid */}
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
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 sm:p-6 cursor-pointer flex flex-col justify-between min-h-[160px] group ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-1 dark:bg-white/[0.1] dark:border-white/40 dark:text-white dark:ring-2 dark:ring-white/20"
                  : "bg-white border-slate-200/80 hover:border-black hover:-translate-y-1 shadow-sm text-slate-900 dark:bg-[#0c0d12]/90 dark:border-white/[0.08] dark:hover:border-white dark:hover:bg-[#11121a]/90 dark:text-white"
              }`}
            >
              {/* Giant Translucent Stroke Watermark in Background */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 text-black/[0.03] group-hover:text-black/[0.06] dark:text-white/[0.03] dark:group-hover:text-white/[0.08] transition-all duration-300 pointer-events-none flex items-center justify-center">
                <Icon className="w-full h-full stroke-[1]" />
              </div>

              {/* Top Row: Icon & Product Count Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-white/20 text-white dark:bg-white dark:text-black shadow-md"
                      : "bg-slate-100 border border-slate-200 text-slate-700 group-hover:scale-105 group-hover:border-slate-300 dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:group-hover:border-white/20"
                  }`}
                >
                  {isIconUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border ${
                  isSelected
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/[0.05] dark:border-white/10 dark:text-neutral-300"
                }`}>
                  {cat.productCount} รายการ
                </span>
              </div>

              {/* Middle Row: Name & Description */}
              <div className="relative z-10 mt-3 space-y-1">
                <h3 className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                  isSelected
                    ? "text-white"
                    : "text-slate-900 group-hover:text-black dark:text-white dark:group-hover:text-neutral-100"
                }`}>
                  {cat.name}
                </h3>
                <p className={`text-xs font-light line-clamp-1 ${
                  isSelected
                    ? "text-slate-300 dark:text-neutral-300"
                    : "text-slate-500 dark:text-neutral-400"
                }`}>
                  {cat.description || `รวมสินค้าดิจิทัลในหมวดหมู่ ${cat.name}`}
                </p>
              </div>

              {/* Bottom Row: Clean Single Action Indicator */}
              <div className={`relative z-10 pt-3.5 mt-3.5 border-t flex items-center justify-between text-xs font-medium ${
                isSelected
                  ? "border-white/20"
                  : "border-slate-100 dark:border-white/[0.06]"
              }`}>
                {isSelected ? (
                  <>
                    <span className="text-white flex items-center gap-1.5 font-semibold">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>กำลังกรองสินค้านี้</span>
                    </span>
                    <span className="text-[11px] text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                      คลิกเพื่อยกเลิก
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 group-hover:text-slate-700 dark:text-neutral-400 dark:group-hover:text-white transition-colors">
                      คลิกเพื่อเลือกหมวดหมู่นี้
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:bg-white/[0.05] dark:text-white dark:group-hover:bg-white dark:group-hover:text-black px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-medium">
                      <span>เลือก</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

