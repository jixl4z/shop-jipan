"use client";

import React from "react";
import Link from "next/link";
import { Star, CheckCircle2, MessageSquare, ThumbsUp, Sparkles, ArrowRight } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  product: string;
  comment: string;
  date: string;
  likes: number;
}

const FEATURED_REVIEWS: ReviewItem[] = [
  {
    id: "1",
    author: "Kittisak_Gamer",
    rating: 5,
    product: "บัตรเติมเงิน 1,000 Points",
    comment: "เติมเงินตอนตี 2 สแกนสลิปพร้อมเพย์เงินเข้าไวมาก ไม่ถึง 30 วินาที รหัสกดใช้ในเกมได้ทันที แนะนำเลยครับ!",
    date: "19 ต.ค. 2026",
    likes: 42,
  },
  {
    id: "2",
    author: "NongDew_99",
    rating: 5,
    product: "Premium ดูหนัง 30 วัน (4K)",
    comment: "จอส่วนตัว คมชัด 4K จริง ไม่มีโฆษณา ไม่หลุด แอดมินดูแลดีมาก ซื้อซ้ำร้านนี้รอบที่ 3 แล้วครับ",
    date: "18 ต.ค. 2026",
    likes: 35,
  },
  {
    id: "3",
    author: "Petch_FastLane",
    rating: 5,
    product: "กล่องสุ่ม Diamond ดิจิทัล",
    comment: "เปิดได้ Steam Key เกมหลักร้อย คุ้มเกินราคา 49 บาทมากกก ระบบส่งของเข้าคลังทันที 24 ชม.",
    date: "18 ต.ค. 2026",
    likes: 28,
  },
  {
    id: "4",
    author: "Art_MetaPlayer",
    rating: 5,
    product: "ไอดีเกม VIP โค้ดสกิน Limited",
    comment: "โค้ดแลกสกินแท้ 100% เปลี่ยนข้อมูลได้ครบถ้วน เว็บสวย ใช้งานง่ายมาก โทนสีสบายตาครับ",
    date: "17 ต.ค. 2026",
    likes: 19,
  },
];

export default function CustomerReviewsShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 my-10 sm:my-14 space-y-6">
      {/* Section Header (Monochrome) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>ความประทับใจจากผู้ใช้งานจริง</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Star className="w-5 h-5 text-white fill-white" />
            <span>รีวิวและความประทับใจ (Customer Reviews)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            การันตีความปลอดภัย ซื่อตรง ส่งรหัสทันที 24 ชม. ด้วยคะแนนเฉลี่ย 4.9/5.0 ดาว
          </p>
        </div>

        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:bg-white hover:text-black text-neutral-200 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer border border-white/[0.12]"
        >
          <MessageSquare className="w-4 h-4" />
          <span>ดูรีวิวทั้งหมด & เขียนรีวิว</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURED_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl glass-panel interactive-card flex flex-col justify-between space-y-4 border border-white/[0.08]"
          >
            <div className="space-y-3">
              {/* Reviewer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center font-bold text-xs text-white">
                    {rev.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white truncate max-w-[110px]">
                      {rev.author}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>ซื้อจริง</span>
                    </div>
                  </div>
                </div>

                {/* Stars (Monochrome Silver/White) */}
                <div className="flex items-center gap-0.5 text-white">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-white text-white" />
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div className="text-[11px] text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08] font-medium truncate">
                📦 {rev.product}
              </div>

              {/* Comment text */}
              <p className="text-xs text-neutral-300 leading-relaxed font-light line-clamp-3">
                &quot;{rev.comment}&quot;
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{rev.date}</span>
              <div className="flex items-center gap-1 text-neutral-300">
                <ThumbsUp className="w-3 h-3 text-neutral-400" />
                <span>{rev.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
