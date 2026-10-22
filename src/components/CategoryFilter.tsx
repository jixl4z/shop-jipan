"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Tv, Key, Gift, Package, Layers, ArrowUpRight } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-400" />
            <span>หมวดหมู่สินค้า</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            เลือกดูสินค้าตามหมวดหมู่ที่คุณสนใจ
          </p>
        </div>
        <Link
          href="/categories"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>ดูทั้งหมด</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {/* All Categories Tab */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedSlug === "all"
              ? "bg-white text-black shadow-lg shadow-white/10"
              : "glass-panel text-neutral-300 hover:text-white hover:bg-neutral-800/80"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>ทั้งหมด</span>
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((cat) => {
          const Icon = (cat.icon && ICON_MAP[cat.icon]) || Package;
          const isSelected = selectedSlug === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "glass-panel text-neutral-300 hover:text-white hover:bg-neutral-800/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              {cat.productCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-black/15 text-black" : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {cat.productCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
