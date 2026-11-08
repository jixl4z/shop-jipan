"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Gamepad2, Tv, Key, Gift, Package, Layers, ArrowRight, ChevronRight, Loader2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">หมวดหมู่ทั้งหมด</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <Layers className="w-7 h-7 text-slate-600 dark:text-neutral-400" />
                <span>หมวดหมู่สินค้าทั้งหมด (All Categories)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1 font-light">
                เลือกดูสินค้าตามประเภทที่คุณต้องการ สินค้าทุกชิ้นส่งมอบทันที 24 ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid - Balanced Symmetrical Layout */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-800 dark:text-white" />
            <span>กำลังโหลดหมวดหมู่สินค้า...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white dark:glass-panel border border-slate-200 dark:border-white/10 p-8 space-y-3">
            <Package className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-neutral-200">ยังไม่มีหมวดหมู่สินค้า</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
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
                  className="rounded-2xl bg-white dark:glass-panel interactive-card p-3 sm:p-3.5 border border-slate-200 dark:border-white/[0.08] hover:border-black dark:hover:border-white transition-all duration-300 shadow-md flex flex-col justify-between gap-3 group"
                >
                  {/* Top Banner Graphic / Artwork */}
                  <div className="relative aspect-[21/8] sm:aspect-[21/7] w-full rounded-xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-black/5 dark:border-white/10 shadow-inner">
                    {hasBanner ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cat.bannerImage!}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
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
                          <Icon className="w-14 h-14 sm:w-16 sm:h-16 text-neutral-400 stroke-[1.2]" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Bottom Row: Category Name & Count (Left) + Arrow Icon (Right) */}
                  <div className="flex items-center justify-between px-1">
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 font-light">
                        {cat.productCount} สินค้าในหมวดหมู่นี้
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 group-hover:bg-black group-hover:text-white dark:bg-white/[0.05] dark:text-neutral-400 dark:group-hover:bg-white dark:group-hover:text-black border border-slate-200 dark:border-white/10 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
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
