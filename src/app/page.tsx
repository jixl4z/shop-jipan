"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import FeatureHighlights from "@/components/FeatureHighlights";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ProductCard, { Product } from "@/components/ProductCard";
import StatsCounter from "@/components/StatsCounter";
import CustomerReviewsShowcase from "@/components/CustomerReviewsShowcase";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Search, ShoppingBag, Loader2 } from "lucide-react";

export default function HomePage() {
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
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section (Banner + LED Marquee + 4 Quick Action Dock) */}
        <HeroBanner />

        {/* Storefront Section (Directly Accessible, Balanced) */}
        <div id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Categories Horizontal Tabs */}
          <section id="categories">
            <CategoryFilter
              categories={categories}
              selectedSlug={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>

          {/* Search & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-400" />
                <span>สินค้าพร้อมส่ง (Products)</span>
                <span className="text-xs font-mono font-medium text-neutral-400 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                  {filteredProducts.length} รายการ
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                เลือกซื้อสินค้าและรับรหัสเข้าคลังสินค้าทันที 24 ชั่วโมง
              </p>
            </div>

            {/* Minimalist Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span>กำลังโหลดรายการสินค้าพร้อมจำหน่าย...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl glass-panel p-8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto text-neutral-400 text-xl">
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
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* Live Orders Ticker */}
        <RecentOrdersTicker />

        {/* Realtime Store Stats Counter */}
        <StatsCounter />

        {/* Customer Reviews Showcase */}
        <CustomerReviewsShowcase />

        {/* Feature Highlights & Guarantees */}
        <FeatureHighlights />

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
