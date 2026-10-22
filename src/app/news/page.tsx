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

const NEWS_ARTICLES: NewsItem[] = [
  {
    id: "1",
    slug: "grand-opening",
    title: "ฉลองเปิดร้านใหม่ JIPAN STORE แจกโค้ดส่วนลดและกิจกรรมพิเศษ",
    summary: "ยินดีต้อนรับสู่ศูนย์รวมสินค้าดิจิทัลและไอดีเกมอัตโนมัติ พบกับสินค้าราคาเปิดร้านลดสูงสุดถึง 50% ตลอดสัปดาห์นี้",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    date: "19 ตุลาคม 2026",
    tag: "ข่าวประกาศ",
  },
  {
    id: "2",
    slug: "promptpay-automated",
    title: "เปิดให้บริการระบบสแกนสลิปพร้อมเพย์ & ทรูวอเล็ท เงินเข้าใน 1 นาที",
    summary: "อัปเกรดระบบตรวจสลิปอัจฉริยะผ่าน SlipOK API เงินเข้ากระเป๋าทันทีตลอด 24 ชั่วโมง และรองรับการส่งซองของขวัญ TrueMoney Wallet",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    date: "18 ตุลาคม 2026",
    tag: "ระบบการเงิน",
  },
  {
    id: "3",
    slug: "instant-delivery-guarantee",
    title: "ระบบจัดส่งอัตโนมัติ 24 ชั่วโมง ซื้อปุ๊บรับรหัสทันทีใน 'คลังของฉัน'",
    summary: "ไม่ต้องรอแอดมินตอบ! เมื่อคุณกดซื้อสินค้า ระบบจะตัดสต็อกและส่งมอบรหัส/คีย์ลงในคลังของคุณทันที พร้อมปุ่ม 1-Click Copy",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    date: "17 ตุลาคม 2026",
    tag: "อัปเดตระบบ",
  },
  {
    id: "4",
    slug: "review-event",
    title: "กิจกรรมส่งรีวิวความประทับใจ ลุ้นรับยอดเงินเติมเครดิตฟรี 100 บาท",
    summary: "สำหรับลูกค้าที่ซื้อสินค้าแล้วเขียนรีวิวในหน้ารีวิว รับสิทธิ์ลุ้นเครดิตเติมเงินฟรีในกระเป๋าทุกสัปดาห์",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    date: "16 ตุลาคม 2026",
    tag: "กิจกรรม",
  },
];

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

        {/* News Grid */}
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
      </main>

      <Footer />
      <AuthModal />
      <TopupModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
