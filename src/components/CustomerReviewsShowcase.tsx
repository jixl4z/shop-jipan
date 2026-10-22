"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  avatar?: string | null;
  rating: number;
  product: string;
  comment: string;
  date: string;
}

export default function CustomerReviewsShowcase() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If loading or no real reviews exist yet, hide section to avoid showing fake/mock data
  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 my-10 sm:my-14 space-y-6">
      {/* Section Header (Monochrome) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>ความประทับใจจากลูกค้าจริง</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Star className="w-5 h-5 text-white fill-white" />
            <span>รีวิวจากลูกค้า (Customer Reviews)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            ความคิดเห็นจากผู้ใช้งานจริง การันตีความปลอดภัยและระบบอัตโนมัติ 24 ชม.
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
        {reviews.map((rev) => (
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
                      <span>ลูกค้าจริง</span>
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
              {rev.product && (
                <div className="text-[11px] text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08] font-medium truncate">
                  📦 {rev.product}
                </div>
              )}

              {/* Comment text */}
              <p className="text-xs text-neutral-300 leading-relaxed font-light line-clamp-3">
                &quot;{rev.comment}&quot;
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
