"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, CheckCircle2, MessageSquare, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ReviewItem {
  id: string;
  author: string;
  avatar?: string | null;
  rating: number;
  product: string;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const { user, addToast, currentTheme, openAuth } = useStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenWrite = () => {
    if (!user) {
      addToast("กรุณาเข้าสู่ระบบก่อนเขียนรีวิว", "info");
      openAuth("login");
      return;
    }
    setIsWriteOpen(true);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (trimmed.length < 10) {
      addToast("กรุณาระบุความคิดเห็นอย่างน้อย 10 ตัวอักษร (ไม่รับรีวิวส่งๆ)", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: trimmed,
          productName: productName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "บันทึกรีวิวไม่สำเร็จ", "error");
        return;
      }

      addToast("ขอบคุณสำหรับการรีวิว! ความคิดเห็นของคุณถูกบันทึกแล้ว", "success");
      setIsWriteOpen(false);
      setComment("");
      setProductName("");
      setRating(5);
      await fetchReviews();
    } catch {
      addToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("คุณต้องการลบรีวิวนี้ใช่หรือไม่?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "ลบรีวิวไม่สำเร็จ", "error");
        return;
      }
      addToast("ลบรีวิวเรียบร้อยแล้ว", "success");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      addToast("เกิดข้อผิดพลาดในการลบรีวิว", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

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
              onClick={handleOpenWrite}
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
                {avgRating}
                <span className="text-lg text-neutral-500 font-normal">/5.0</span>
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
                <span className="text-neutral-200 font-semibold">รีวิวจากผู้ใช้งานจริง</span>
              </div>
              <div>จำนวนรีวิวทั้งหมด {reviews.length} รายการ</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 px-4 py-2 rounded-2xl border border-neutral-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ได้รับความไว้วางใจระดับ 5 ดาว</span>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดรีวิว...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8">
            <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto" />
            <div className="text-base font-bold text-white">ยังไม่มีรีวิวในขณะนี้</div>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              ยังไม่มีลูกค้ารีวิวเข้ามา คุณสามารถสั่งซื้อสินค้าและเป็นคนแรกที่เขียนรีวิวให้คะแนนร้านเราได้เลย!
            </p>
            <button
              onClick={handleOpenWrite}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer ${currentTheme.accent}`}
            >
              <Plus className="w-4 h-4" />
              <span>เขียนรีวิวคนแรก</span>
            </button>
          </div>
        ) : (
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
                          <span>ลูกค้าจริง</span>
                        </span>
                      </div>
                      {rev.product && (
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          สินค้า: <span className="text-neutral-300 font-medium">{rev.product}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1">
                        {rev.date}
                      </div>
                    </div>

                    {/* Admin Delete Action Button */}
                    {user?.role === "ADMIN" && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        disabled={deletingId === rev.id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                        title="ลบรีวิวนี้ (สิทธิ์แอดมิน)"
                      >
                        {deletingId === rev.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light pl-13">
                  &quot;{rev.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Write Review Modal */}
        {isWriteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="font-bold text-base text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>เขียนรีวิวและให้คะแนน</span>
                </div>
                <button
                  onClick={() => setIsWriteOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                {/* User Info Display */}
                <div>
                  <label className="block text-neutral-400 mb-1">ผู้รีวิว</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ""}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">สินค้าหรือบริการที่รีวิว (ระบุหรือไม่ก็ได้)</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="เช่น Capcut Pro 30 วัน, บัตรเติมเงิน..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                  />
                </div>

                {/* Star Rating Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-neutral-400 font-medium">ให้คะแนนความพึงพอใจ</label>
                    <span className="text-xs text-amber-400 font-bold">
                      {rating} / 5 ดาว
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isSelected = rating === s;
                      const isFilled = rating >= s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`relative py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-400/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20 scale-[1.03]"
                              : isFilled
                              ? "bg-amber-400/10 border-amber-400/40 text-amber-400"
                              : "bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-black rounded-full uppercase tracking-wider">
                              เลือก
                            </span>
                          )}
                          <Star
                            className={`w-4 h-4 transition-transform ${
                              isFilled ? "fill-amber-400 text-amber-400" : ""
                            } ${isSelected ? "scale-110" : ""}`}
                          />
                          <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : ""}`}>
                            {s} ดาว
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Confirmation Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold">
                        เลือกแล้ว: {rating} ดาว (
                        {rating === 5
                          ? "ยอดเยี่ยมมาก ประทับใจมาก"
                          : rating === 4
                          ? "ดีมาก บริการรวดเร็ว"
                          : rating === 3
                          ? "ปานกลาง พอใช้ได้"
                          : rating === 2
                          ? "พอใช้ ควรปรับปรุง"
                          : "ควรปรับปรุง"}
                        )
                      </span>
                    </div>
                    <span className="font-mono text-[11px] tracking-wider shrink-0">
                      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-400 font-medium">ข้อความรีวิว / ความคิดเห็น *</label>
                    <span
                      className={`text-[10px] font-mono ${
                        comment.trim().length >= 10 ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    >
                      {comment.trim().length}/500 ตัวอักษร (ขั้นต่ำ 10)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เล่าประสบการณ์การใช้งาน ความรวดเร็ว หรือบริการอย่างละเอียด..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                  />
                  {comment.trim().length > 0 && comment.trim().length < 10 && (
                    <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1 font-light">
                      ⚠️ กรุณาพิมพ์อีก {10 - comment.trim().length} ตัวอักษร (ไม่รับรีวิวส่งๆ หรือตัวอักษรซ้ำๆ)
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || comment.trim().length < 10}
                    className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer ${currentTheme.accent}`}
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>ส่งรีวิว</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
