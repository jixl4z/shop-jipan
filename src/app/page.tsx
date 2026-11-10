"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import FeatureHighlights from "@/components/FeatureHighlights";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ProductCard, { Product } from "@/components/ProductCard";
import CustomerReviewsShowcase from "@/components/CustomerReviewsShowcase";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import BestSellerSpotlight from "@/components/BestSellerSpotlight";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const recommendedProducts = useMemo(() => {
    return products.filter(
      (p) =>
        (Boolean(p.isRecommended) || p.badge === "แนะนำ" || p.badge === "ยอดนิยม") &&
        p.isActive !== false &&
        !p.isSuspended
    );
  }, [products]);

  // Prioritize explicitly recommended products; if none tagged yet, show top active products
  const displayRecommended = useMemo(() => {
    if (recommendedProducts.length > 0) return recommendedProducts;
    return products.filter((p) => p.isActive !== false && !p.isSuspended).slice(0, 4);
  }, [recommendedProducts, products]);

  // Fetch categories & products
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products", { cache: "no-store" }),
        ]);
        const catData = (await catRes.json()) as any;
        const prodData = (await prodRes.json()) as any;

        if (catData?.categories) setCategories(catData.categories);
        else if (Array.isArray(catData)) setCategories(catData);

        if (prodData?.products) setProducts(prodData.products);
        else if (Array.isArray(prodData)) setProducts(prodData);
      } catch (err) {
        console.error("Failed to load store data:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section (Banner + LED Marquee + 4 Quick Action Dock) */}
        <HeroBanner />

        {/* Storefront Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 space-y-6 sm:space-y-8">
          {/* Best Seller Spotlight Banner */}
          <BestSellerSpotlight products={products} />

          {/* Recommended Products Grid (Always located directly before Categories) */}
          {displayRecommended.length > 0 && (
            <section id="recommended" className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                      <span>สินค้าแนะนำ</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                        RECOMMENDED
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-light">
                      สินค้าคุณภาพยอดนิยมที่ทางร้านคัดสรรมาให้คุณเป็นพิเศษ
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                {displayRecommended.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Categories Grid (Direct Navigation) */}
          <section id="categories">
            <CategoryFilter categories={categories} />
          </section>
        </div>

        {/* Live Orders Ticker */}
        <RecentOrdersTicker />

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
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
