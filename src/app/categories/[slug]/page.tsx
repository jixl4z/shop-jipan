"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import AuthModal from "@/components/AuthModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { ArrowLeft, Loader2, Layers, ShoppingBag, Package } from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  const slug = decodeURIComponent(rawSlug);

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryDesc, setCategoryDesc] = useState<string>("");
  const [categoryBanner, setCategoryBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products?category=${encodeURIComponent(slug)}`).then((r) => r.json()),
    ])
      .then(([catData, prodData]: any) => {
        const cats = Array.isArray(catData) ? catData : (catData?.categories || []);
        const matched = cats.find(
          (c: { slug: string; name: string; bannerImage?: string; description?: string }) =>
            c.slug === slug ||
            c.slug === rawSlug ||
            c.name === slug ||
            c.slug?.toLowerCase() === slug.toLowerCase() ||
            c.name?.toLowerCase() === slug.toLowerCase()
        );
        if (matched) {
          setCategoryName(matched.name);
          setCategoryDesc(matched.description || "");
          setCategoryBanner(matched.bannerImage || null);
        }
        const prods = Array.isArray(prodData) ? prodData : (prodData?.products || []);
        setProducts(prods);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug, rawSlug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-black dark:hover:text-white transition-colors">
            หมวดหมู่
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">{categoryName || slug}</span>
        </div>

        {/* Header / Category Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0d12]/90 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md dark:shadow-xl">
          {categoryBanner && (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={categoryBanner}
                alt={categoryName}
                className="w-full h-full object-cover opacity-20 dark:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-neutral-950 dark:via-neutral-950/80 dark:to-transparent" />
            </div>
          )}

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-700/80 text-slate-700 dark:text-neutral-300 text-xs font-medium backdrop-blur-md">
              <Layers className="w-3.5 h-3.5" />
              <span>หมวดหมู่สินค้า</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {categoryName || slug}
            </h1>
            {categoryDesc && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 mt-1 font-light max-w-2xl drop-shadow-sm">
                {categoryDesc}
              </p>
            )}
          </div>

          <Link
            href="/categories"
            className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-xs text-slate-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors shrink-0 backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ดูหมวดหมู่อื่น</span>
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดรายการสินค้าในหมวดหมู่นี้...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-850 flex items-center justify-center mx-auto text-neutral-400">
              <Package className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="font-bold text-base text-neutral-200">
              ยังไม่มีสินค้าในหมวดหมู่นี้
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              แอดมินยังไม่ได้ลงสินค้าในหมวดนี้ โปรดเลือกดูหมวดหมู่อื่น
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
