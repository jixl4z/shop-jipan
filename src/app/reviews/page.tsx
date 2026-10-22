"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { Star, CheckCircle2, MessageSquare, ThumbsUp, Sparkles, Filter, Plus } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  product: string;
  comment: string;
  date: string;
  likes: number;
}

const INITIAL_REVIEWS: ReviewItem[] = [
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
  {
    id: "5",
    author: "Ice_CyberPro",
    rating: 5,
    product: "Season Pass พาสเกมยอดฮิต",
    comment: "ราคาถูกกว่าเติมตรงเยอะมาก คีย์ส่งไว ไม่ต้องรอแอดมินตอบ ระบบออโต้ดีที่สุดในไทยแล้วตอนนี้",
    date: "16 ต.ค. 2026",
    likes: 54,
  },
];

export default function ReviewsPage() {
  const { user, addToast, currentTheme } = useStore();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [authorName, setAuthorName] = useState(user?.username || "");
  const [productName, setProductName] = useState("บัตรเติมเงินและบริการดิจิทัล");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev: ReviewItem = {
      id: Date.now().toString(),
      author: user?.username || authorName || "ผู้ใช้งานไม่ประสงค์ออกนาม",
      rating,
      product: productName,
      comment,
      date: "วันนี้",
      likes: 1,
    };

    setReviews([newRev, ...reviews]);
    addToast("ขอบคุณสำหรับการรีวิว! ความคิดเห็นของคุณถูกเผยแพร่แล้ว", "success");
    setIsWriteOpen(false);
    setComment("");
  };

  const handleLike = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)));
  };

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
            <span className="text-white">รีวิวจากลูกค้า</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
                <span>รีวิวและความประทับใจจากลูกค้า</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
                ความคิดเห็นจากผู้ใช้งานจริง การันตีความปลอดภัยและระบบอัตโนมัติ 24 ชม.
              </p>
            </div>

            <button
              onClick={() => setIsWriteOpen(true)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer ${currentTheme.accent}`}
            >
              <Plus className="w-4 h-4" />
              <span>เขียนรีวิวสินค้า</span>
            </button>
          </div>
        </div>

        {/* Rating Summary Card */}
        <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                4.9<span className="text-lg text-neutral-500 font-normal">/5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mt-1 justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-neutral-800" />
            <div className="text-xs text-neutral-400 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-200 font-semibold">ยืนยันคำสั่งซื้อแล้ว 100%</span>
              </div>
              <div>จากผู้ใช้งานที่ทำรายการสำเร็จกว่า 20,500+ ออเดอร์</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 px-4 py-2 rounded-2xl border border-neutral-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ได้รับความไว้วางใจระดับ 5 ดาว</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center font-bold text-white text-sm">
                    {rev.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{rev.author}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ซื้อจริง</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      สินค้า: <span className="text-neutral-300 font-medium">{rev.product}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1 font-mono">{rev.date}</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light pl-13">
                &quot;{rev.comment}&quot;
              </p>

              <div className="pt-2 flex items-center justify-between pl-13 text-xs text-neutral-400">
                <button
                  onClick={() => handleLike(rev.id)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>มีประโยชน์ ({rev.likes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Write Review Modal */}
        {isWriteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setIsWriteOpen(false)} />
            <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="font-bold text-base text-white">เขียนรีวิวสินค้าของคุณ</h3>
                <button
                  onClick={() => setIsWriteOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddReview} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    ชื่อของคุณ (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="เช่น Dew_Gamer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">สินค้าที่ซื้อ</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="เช่น บัตรเติมเงิน 1,000 Points"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">คะแนนความพึงพอใจ</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= rating ? "fill-amber-400" : "text-neutral-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-neutral-400 ml-2 font-bold">{rating} ดาว</span>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">ข้อความรีวิว</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="บอกเล่าความประทับใจเกี่ยวกับความไวและบริการของร้านค้า..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${currentTheme.accent}`}
                >
                  ส่งความคิดเห็นรีวิว
                </button>
              </form>
            </div>
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
