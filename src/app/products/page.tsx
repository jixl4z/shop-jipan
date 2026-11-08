"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Search, ShoppingBag, Filter, Loader2, ArrowUpDown, Package } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const { currentTheme } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "price-asc" | "price-desc">("latest");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([prodData, catData]: any) => {
        const prods = Array.isArray(prodData) ? prodData : (prodData?.products || []);
        const cats = Array.isArray(catData) ? catData : (catData?.categories || []);
        setProducts(prods);
        setCategories(cats);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = selectedCat === "all" || p.category?.slug === selectedCat;
      const matchSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      const matchStock = !onlyInStock || p.stockCount > 0;
      return matchCat && matchSearch && matchStock;
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCat, search, onlyInStock, sortBy]);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">สินค้าทั้งหมด</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-neutral-400" />
              <span>สินค้าทั้งหมด (Products Catalog)</span>
              <span className="text-xs font-mono font-medium text-neutral-400 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
                {filteredProducts.length} รายการ
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              เลือกซื้อคีย์เกม บัตรเติมเงิน และบริการดิจิทัลพร้อมส่งมอบอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-3xl glass-panel space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า รายละเอียด หรือคีย์เวิร์ด..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-3.5 pr-8 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-black/30 dark:focus:border-white/30 cursor-pointer appearance-none transition-colors"
                >
                  <option value="latest" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">เรียงตาม: ล่าสุด</option>
                  <option value="price-asc" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">ราคา: ต่ำไปสูง</option>
                  <option value="price-desc" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">ราคา: สูงไปต่ำ</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>

              {/* In-Stock Toggle */}
              <button
                type="button"
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  onlyInStock
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                    : "bg-black/[0.04] dark:bg-white/[0.05] border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${onlyInStock ? "bg-emerald-500" : "bg-neutral-400"}`} />
                <span>เฉพาะพร้อมส่ง</span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer font-medium ${
                selectedCat === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-sm"
                  : "bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.slug)}
                className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer font-medium ${
                  selectedCat === c.slug
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-sm"
                    : "bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-neutral-900/60 border border-white/[0.06] overflow-hidden p-4 space-y-3.5"
              >
                <div className="w-full aspect-[16/10] bg-neutral-800 rounded-xl" />
                <div className="space-y-2">
                  <div className="w-20 h-3 bg-neutral-800 rounded" />
                  <div className="w-3/4 h-5 bg-neutral-800 rounded" />
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div className="w-16 h-6 bg-neutral-800 rounded" />
                  <div className="w-20 h-8 bg-neutral-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-850 flex items-center justify-center mx-auto text-neutral-400">
              <Package className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="font-bold text-base text-neutral-200">
              ไม่พบสินค้าตามเงื่อนไขที่ค้นหา
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูสินค้าทั้งหมด
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCat("all");
                setOnlyInStock(false);
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
