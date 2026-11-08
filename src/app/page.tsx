"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import FeatureHighlights from "@/components/FeatureHighlights";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import { Product } from "@/components/ProductCard";
import CustomerReviewsShowcase from "@/components/CustomerReviewsShowcase";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import BestSellerSpotlight from "@/components/BestSellerSpotlight";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch categories & products
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
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
