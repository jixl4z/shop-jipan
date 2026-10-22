"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
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

      {/* Main Top Banner Carousel */}
      <HeroBanner />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
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

        {/* Categories Grid - Styled as Rich Banner Cards */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดหมวดหมู่สินค้า...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 space-y-3">
            <Package className="w-12 h-12 text-neutral-500 mx-auto" />
            <h3 className="font-bold text-base text-neutral-200">ยังไม่มีหมวดหมู่สินค้า</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              ยังไม่มีการสร้างหมวดหมู่ในระบบ โปรดตรวจสอบอีกครั้งในภายหลัง
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = (cat.icon && ICON_MAP[cat.icon]) || Package;
              const hasBanner = !!cat.bannerImage;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-neutral-800 hover:border-neutral-700 bg-neutral-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 min-h-[220px] flex flex-col justify-between"
                >
                  {/* Banner Image Background */}
                  {hasBanner ? (
                    <div className="absolute inset-0 z-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.bannerImage!}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-45 group-hover:opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/30" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-850 via-neutral-900 to-neutral-950">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl group-hover:bg-white/[0.08] transition-all" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-neutral-800/40 rounded-full blur-2xl" />
                    </div>
                  )}

                  {/* Top Row: Icon Badge & Count */}
                  <div className="relative z-10 p-6 flex items-start justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-md shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-[11px] font-mono text-neutral-300 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{cat.productCount} รายการ</span>
                    </span>
                  </div>

                  {/* Bottom Row: Name, Description & Explore Button */}
                  <div className="relative z-10 p-6 pt-0 space-y-3">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors drop-shadow-md">
                        {cat.name}
                      </h2>
                      {cat.description ? (
                        <p className="text-xs text-neutral-300 font-light line-clamp-2 mt-1 leading-relaxed drop-shadow">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 font-light mt-1">
                          รวมสินค้าในหมวดหมู่ {cat.name}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-400 group-hover:text-neutral-200 transition-colors">
                        เข้าชมหมวดหมู่นี้
                      </span>
                      <span className="flex items-center gap-1 text-white group-hover:translate-x-1.5 transition-transform bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                        <span>ดูสินค้าทั้งหมด</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
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
