"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import DeliveredDataViewer from "@/components/DeliveredDataViewer";
import { copyToClipboard } from "@/lib/clipboard";
import {
  Package,
  Calendar,
  ArrowLeft,
  ShieldAlert,
  X,
  Search,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface OrderRecord {
  id: string;
  orderNumber: string;
  productName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  deliveredData: string;
  status: string;
  createdAt: string;
  product?: {
    image: string;
    slug: string;
  };
}

export default function DedicatedOrdersPage() {
  const { user, openAuth, addToast } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimOrder, setClaimOrder] = useState<OrderRecord | null>(null);
  const [claimCopied, setClaimCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const getClaimText = (o: OrderRecord) => {
    return `📌 [แจ้งปัญหา / ขอเคลมสินค้า - JIPAN STORE]
- เลขที่ออเดอร์: ${o.orderNumber}
- สินค้า: ${o.productName} (${o.quantity} ชิ้น)
- สั่งซื้อเมื่อ: ${new Date(o.createdAt).toLocaleString("th-TH")}
- ปัญหาที่พบ: (โปรดระบุ เช่น รหัสเข้าไม่ได้ / หลุดพรีเมียม)
- ข้อมูลรหัสที่ได้รับ: 
${o.deliveredData}`;
  };

  const handleCopyClaim = async (o: OrderRecord) => {
    const ok = await copyToClipboard(getClaimText(o));
    if (ok) {
      setClaimCopied(true);
      addToast("คัดลอกข้อความเคลมสินค้าแล้ว! สามารถส่งแอดมินได้ทันที", "success");
      setTimeout(() => setClaimCopied(false), 2000);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.deliveredData.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">คลังของฉัน (Orders & Inventory)</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>จัดเก็บรหัสถาวร 24 ชม.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Package className="w-7 h-7 text-white" />
              <span>คลังสินค้าของฉัน (My Inventory)</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              รหัสสินค้าดิจิทัล คีย์เกม และบัญชีทั้งหมดที่คุณสั่งซื้อจะถูกเก็บไว้ที่นี่ตลอดชีพ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>เงื่อนไขการรับประกัน</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shrink-0 active:scale-95 shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>เลือกซื้อสินค้าเพิ่ม</span>
            </Link>
          </div>
        </div>

        {/* Search Bar (Only shown if user has orders) */}
        {user && orders.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อสินค้า, เลขที่ออเดอร์, หรือรหัสที่ได้รับ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900/80 border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!user ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-white/[0.08] p-8 space-y-4">
            <Package className="w-12 h-12 text-neutral-500 mx-auto" />
            <h3 className="font-bold text-base text-white">
              กรุณาเข้าสู่ระบบเพื่อดูคลังสินค้าของคุณ
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              เข้าสู่ระบบด้วยบัญชีที่คุณใช้สั่งซื้อสินค้าเพื่อดูรหัสที่ได้รับ
            </p>
            <button
              onClick={() => openAuth("login")}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        ) : loading ? (
          /* High-End Skeleton Shimmer Loading (Eliminates Layout Shift) */
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-6 rounded-3xl bg-neutral-900/50 border border-white/[0.05] space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                  <div className="space-y-2">
                    <div className="w-28 h-3.5 bg-neutral-800 rounded-md" />
                    <div className="w-48 h-5 bg-neutral-800 rounded-md" />
                  </div>
                  <div className="w-24 h-8 bg-neutral-800 rounded-xl" />
                </div>
                <div className="w-full h-24 bg-neutral-950/80 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-white/[0.08] p-8 space-y-4">
            <Package className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-bold text-base text-white">
              ยังไม่มีประวัติการสั่งซื้อ
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              เมื่อคุณสั่งซื้อสินค้า รหัสจะถูกส่งมอบและบันทึกไว้ที่นี่ทันที
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              เลือกซื้อสินค้าเลย
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-neutral-900/40 border border-white/[0.08] p-8 space-y-3">
            <Search className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="text-sm font-semibold text-white">
              ไม่พบออเดอร์ที่ตรงกับ &quot;{searchQuery}&quot;
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              ดูออเดอร์ทั้งหมด
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((o) => {
              const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={o.id}
                  className="p-5 sm:p-6 rounded-3xl glass-panel interactive-card space-y-4 shadow-xl border border-white/[0.08]"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                    <div>
                      <div className="text-[11px] font-mono text-neutral-400 font-medium">
                        ออเดอร์: {o.orderNumber}
                      </div>
                      <h2 className="font-bold text-base sm:text-lg text-white mt-0.5">
                        {o.productName}
                      </h2>
                      <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-white">
                          ฿{o.totalAmount.toFixed(2)} ({o.quantity} ชิ้น)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Claim Button */}
                      <button
                        onClick={() => setClaimOrder(o)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95"
                        title="แจ้งปัญหาหรือขอเคลมสินค้านี้"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                        <span>แจ้งปัญหา / เคลม</span>
                      </button>
                    </div>
                  </div>

                  {/* Smart Delivered Data Viewer (Handles multi-items, credentials, no select-all bug!) */}
                  <DeliveredDataViewer
                    deliveredData={o.deliveredData}
                    quantity={o.quantity}
                    onCopiedToast={(msg) => addToast(msg, "info")}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Claim Modal */}
        {claimOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setClaimOrder(null)} />
            <div className="relative w-full max-w-lg bg-neutral-900 border border-white/[0.12] rounded-3xl p-6 shadow-2xl z-10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/15 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">แจ้งปัญหา / เคลมสินค้า</h3>
                    <p className="text-xs text-neutral-400">
                      ออเดอร์: <span className="font-mono text-white">{claimOrder.orderNumber}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setClaimOrder(null)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-neutral-300 leading-relaxed">
                  หากพบปัญหาสินค้าใช้งานไม่ได้ รหัสผิดพลาด หรือหลุดพรีเมียม
                  คุณสามารถคัดลอกข้อความด้านล่างนี้แล้วส่งให้แอดมินผ่านช่องทางติดต่อเพื่อเคลมสินค้าชิ้นใหม่ได้ทันทีครับ
                </p>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>แบบฟอร์มเคลมสินค้า:</span>
                    <button
                      onClick={() => handleCopyClaim(claimOrder)}
                      className="flex items-center gap-1 text-white hover:underline cursor-pointer font-semibold"
                    >
                      {claimCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกแบบฟอร์ม</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-neutral-900 border border-white/[0.06] text-neutral-300 font-mono text-[11px] whitespace-pre-wrap break-all select-text leading-relaxed">
                    {getClaimText(claimOrder)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyClaim(claimOrder)}
                  className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  {claimCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{claimCopied ? "คัดลอกเรียบร้อยแล้ว!" : "คัดลอกข้อความเคลม"}</span>
                </button>
                <Link
                  href="/support"
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>ติดต่อแอดมิน</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <AuthModal />
      <TopupModal />
      <BuyModal />
    </div>
  );
}
