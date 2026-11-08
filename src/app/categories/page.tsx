"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Gamepad2, Tv, Key, Gift, Package, Layers, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount: number;
  bannerImage?: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Gamepad2,
  Tv,
  Key,
  Gift,
  Package,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <span className="text-white">หมวดหมู่ทั้งหมด</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Layers className="w-7 h-7 text-neutral-400" />
                <span>หมวดหมู่สินค้าทั้งหมด (All Categories)</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
                เลือกดูสินค้าตามประเภทที่คุณต้องการ สินค้าทุกชิ้นส่งมอบทันที 24 ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid - Balanced Symmetrical Layout */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดหมวดหมู่สินค้า...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center rounded-2xl glass-panel p-8 space-y-3">
            <Package className="w-12 h-12 text-neutral-500 mx-auto" />
            <h3 className="font-bold text-base text-neutral-200">ยังไม่มีหมวดหมู่สินค้า</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              ยังไม่มีการสร้างหมวดหมู่ในระบบ โปรดตรวจสอบอีกครั้งในภายหลัง
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {categories.map((cat) => {
              const Icon = (cat.icon && ICON_MAP[cat.icon]) || Package;
              const hasBanner = !!cat.bannerImage;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 min-h-[180px] p-5 sm:p-6 flex flex-col justify-between bg-white border-slate-200/80 hover:border-black text-slate-900 dark:bg-gradient-to-br dark:from-[#0e0f15]/90 dark:to-[#07080a]/90 dark:border-white/[0.08] dark:hover:border-white dark:text-white"
                >
                  {/* Banner Image Background (If present) */}
                  {hasBanner ? (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.bannerImage!}
                        alt={cat.name}
                        className="w-full h-full object-cover opacity-15 dark:opacity-20 group-hover:opacity-25 dark:group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#07080a] dark:via-[#07080a]/80" />
                    </div>
                  ) : null}

                  {/* Giant Translucent Stroke Watermark in Background */}
                  <div className="absolute -right-4 -bottom-4 w-36 h-36 text-black/[0.03] group-hover:text-black/[0.06] dark:text-white/[0.03] dark:group-hover:text-white/[0.08] transition-all duration-300 pointer-events-none flex items-center justify-center">
                    <Icon className="w-full h-full stroke-[1]" />
                  </div>

                  {/* Top Row: Icon Badge & Count */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/[0.06] dark:border-white/10 dark:text-white flex items-center justify-center group-hover:scale-105 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all shadow-sm">
                      <Icon className="w-5 h-5 text-current" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/[0.05] dark:border-white/10 text-xs font-mono dark:text-neutral-300">
                      <span>{cat.productCount} รายการ</span>
                    </span>
                  </div>

                  {/* Middle Row: Name & Description */}
                  <div className="relative z-10 mt-4 space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-black dark:text-white dark:group-hover:text-neutral-100 transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-light line-clamp-2 leading-relaxed">
                      {cat.description || `รวมสินค้าดิจิทัลและไอดีในหมวดหมู่ ${cat.name}`}
                    </p>
                  </div>

                  {/* Bottom Row: Clean Single Action Indicator */}
                  <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400 group-hover:text-slate-700 dark:text-neutral-400 dark:group-hover:text-white transition-colors">
                      ดูสินค้าทั้งหมดในหมวดหมู่นี้
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white border-slate-200 dark:bg-white/[0.05] dark:text-white dark:group-hover:bg-white dark:group-hover:text-black px-3 py-1.5 rounded-xl border dark:border-white/10 transition-all font-medium">
                      <span>เปิดดูสินค้า</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal />
      <TopupModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
