"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import FeatureHighlights from "@/components/FeatureHighlights";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ProductCard, { Product } from "@/components/ProductCard";
import StatsCounter from "@/components/StatsCounter";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Search, ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function HomePage() {
  const { currentTheme } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories & products
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (prodData.products) setProducts(prodData.products);
      } catch (err) {
        console.error("Failed to load store data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by selected category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "all" || p.category?.slug === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Live Orders Ticker */}
        <RecentOrdersTicker />

        {/* Feature Highlights */}
        <FeatureHighlights />

        {/* Realtime Store Stats Counter (Like Fluffyshop) */}
        <StatsCounter />

        {/* Storefront Section */}
        <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Categories */}
          <section id="categories">
            <CategoryFilter
              categories={categories}
              selectedSlug={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>

          {/* Search & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-900">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-400" />
                <span>สินค้าทั้งหมด (Products)</span>
                <span className="text-xs font-mono font-medium text-neutral-400 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800">
                  {filteredProducts.length} ชิ้น
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                เลือกซื้อสินค้าดิจิทัลและรับรหัสทันที 24 ชม.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span>กำลังโหลดรายการสินค้าพร้อมจำหน่าย...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800/80 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-850 flex items-center justify-center mx-auto text-neutral-500 text-xl">
                📦
              </div>
              <h3 className="font-bold text-base text-neutral-200">
                ไม่พบสินค้าในหมวดหมู่นี้
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                ลองค้นหาด้วยคำอื่น หรือเลือกดูหมวดหมู่อื่นเพื่อค้นหาสินค้าที่คุณต้องการ
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <TopupModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
