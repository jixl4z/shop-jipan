"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Newspaper, Calendar, ArrowRight, Sparkles } from "lucide-react";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  tag: string;
}

const NEWS_ARTICLES: NewsItem[] = [];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <span className="text-white">โปรโมชั่นและข่าวสาร</span>
          </div>

          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Newspaper className="w-7 h-7 text-neutral-400" />
              <span>โปรโมชั่นและข่าวสารร้านค้า (News & Events)</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              ติดตามข่าวสารการอัปเดตสินค้าใหม่ กิจกรรมแจกของรางวัล และโปรโมชั่นลดราคาสุดพิเศษ
            </p>
          </div>
        </div>

        {/* Empty State */}
        {NEWS_ARTICLES.length === 0 ? (
          <div className="py-24 text-center space-y-4 rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 flex items-center justify-center mx-auto text-neutral-500">
              <Newspaper className="w-8 h-8 text-neutral-400" />
            </div>
            <div className="text-base font-bold text-white">ยังไม่มีข่าวสารหรือประกาศในขณะนี้</div>
            <p className="text-xs text-neutral-400 max-w-md mx-auto font-light leading-relaxed">
              ติดตามข่าวสาร โปรโมชั่นลดราคาพิเศษ และกิจกรรมแจกของรางวัลได้ที่หน้านี้เร็วๆ นี้
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {NEWS_ARTICLES.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-xl"
              >
                <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    {item.tag}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{item.date}</span>
                    </div>
                    <h2 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-xs text-neutral-400 line-clamp-2 font-light leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-300 group-hover:text-white">
                    <span>อ่านรายละเอียด</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
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
