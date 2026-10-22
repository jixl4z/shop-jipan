"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Gamepad2, Tv, Key, Gift, Package, Layers, ArrowRight, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface CategoryItem {
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

export default function CategoriesPage() {
  const { currentTheme } = useStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
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

        {/* Categories Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดหมวดหมู่สินค้า...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const Icon = (cat.icon && ICON_MAP[cat.icon]) || Package;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="relative p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:bg-neutral-900"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all pointer-events-none" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform backdrop-blur-md">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </h2>

                    {cat.description && (
                      <p className="text-xs text-neutral-400 mt-2 font-light line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-400">
                      {cat.productCount} รายการ
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>ดูสินค้า</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
