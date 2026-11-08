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
  Home,
  ChevronRight,
  ShieldAlert,
  X,
  Search,
  HelpCircle,
  Copy,
  Check,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  FileEdit,
  ExternalLink,
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
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
  const [claimOrder, setClaimOrder] = useState<OrderRecord | null>(null);
  const [claimCopied, setClaimCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.orders)) setOrders(data.orders);
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
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#060608] text-neutral-900 dark:text-white flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Breadcrumb (Exact match to screenshot 3) */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Link
            href="/"
            className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าแรก</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 dark:text-neutral-200 font-semibold">สถานะคำสั่งซื้อ</span>
        </div>

        {/* Header (Exact match to screenshot 3) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              ORDER HISTORY
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              สถานะคำสั่งซื้อ
            </h1>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e6decf] hover:bg-[#ded5c5] dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-[#d8cdbd] dark:border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>เลือกซื้อสินค้า</span>
          </Link>
        </div>

        {/* 3 Summary Stat Cards (Exact match to screenshot 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: สินค้าที่ได้รับ */}
          <div className="rounded-3xl bg-[#f2ebe1] dark:bg-[#0e1017] border border-[#e5dcd0] dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-light">
                สินค้าที่ได้รับ
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-neutral-900 dark:text-white">
                {orders.length} ชิ้น
              </div>
            </div>
          </div>

          {/* Card 2: ออร์เดอร์แบบฟอร์ม */}
          <div className="rounded-3xl bg-[#f2ebe1] dark:bg-[#0e1017] border border-[#e5dcd0] dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 flex items-center justify-center shrink-0">
              <FileEdit className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-light">
                ออร์เดอร์แบบฟอร์ม
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-neutral-900 dark:text-white">
                0 รายการ
              </div>
            </div>
          </div>

          {/* Card 3: รอดำเนินการ */}
          <div className="rounded-3xl bg-[#f2ebe1] dark:bg-[#0e1017] border border-[#e5dcd0] dark:border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-light">
                รอดำเนินการ
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-neutral-900 dark:text-white">
                0 รายการ
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar (Screenshot 4) */}
        {user && orders.length > 0 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อสินค้า, เลขที่ออเดอร์, หรือรหัสที่ได้รับ..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f2ebe1] dark:bg-[#0e1017] border border-[#e5dcd0] dark:border-white/[0.08] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 dark:focus:border-white/30 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        )}

        {/* Main Orders Section Container */}
        <div className="rounded-3xl bg-[#f2ebe1] dark:bg-[#0e1017] border border-[#e5dcd0] dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
          {/* Section Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5dcd0] dark:border-white/[0.08]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                <h2 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                  รายการสั่งซื้อ
                </h2>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                {orders.length === 0
                  ? "ยังไม่มีรายการในหมวดนี้"
                  : `พบรายการสั่งซื้อทั้งหมด ${orders.length} รายการ`}
              </p>
            </div>

            {/* Tab Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("standard")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "standard"
                    ? "bg-[#18191f] text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>สินค้าปกติ {orders.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "custom"
                    ? "bg-[#18191f] text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>ออร์เดอร์แบบฟอร์ม 0</span>
              </button>
            </div>
          </div>

          {/* Orders Content */}
          {!user ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 text-neutral-500 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  เข้าสู่ระบบด้วยบัญชีที่คุณใช้สั่งซื้อสินค้าเพื่อดูรหัสที่ได้รับ
                </p>
              </div>
              <button
                onClick={() => openAuth("login")}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#18191f] text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                เข้าสู่ระบบทันที
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-4 animate-pulse py-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-2xl bg-[#ebe4d7] dark:bg-[#141620] border border-[#dfd4c5] dark:border-white/5 space-y-3"
                >
                  <div className="w-32 h-4 bg-neutral-300 dark:bg-neutral-800 rounded" />
                  <div className="w-48 h-5 bg-neutral-300 dark:bg-neutral-800 rounded" />
                  <div className="w-full h-16 bg-neutral-300 dark:bg-neutral-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : activeTab === "custom" || orders.length === 0 ? (
            /* Empty state (Exact match to screenshot 3) */
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#e6decf] dark:bg-white/5 border border-[#d8cdbd] dark:border-white/10 text-neutral-500 flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  ยังไม่มีคำสั่งซื้อ
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  เมื่อสั่งซื้อสินค้าแล้ว รายการจะมาอยู่ที่นี่
                </p>
              </div>
              {orders.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18191f] text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>เลือกซื้อสินค้าเลย</span>
                  </Link>
                </div>
              )}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Search className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                ไม่พบออเดอร์ที่ตรงกับ &quot;{searchQuery}&quot;
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-rose-500 underline cursor-pointer"
              >
                ดูออเดอร์ทั้งหมด
              </button>
            </div>
          ) : (
            /* Order List Cards (Exact match to screenshot 4) */
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={o.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#ebe4d7] dark:bg-[#141620] border border-[#dfd4c5] dark:border-white/5 space-y-4 shadow-sm"
                  >
                    {/* Order Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dfd4c5] dark:border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                          ออเดอร์: {o.orderNumber}
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                          {o.productName}
                        </h3>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{formattedDate}</span>
                          <span>·</span>
                          <span className="font-mono font-bold text-neutral-900 dark:text-white">
                            ฿{o.totalAmount.toFixed(2)} ({o.quantity} ชิ้น)
                          </span>
                        </div>
                      </div>

                      {/* Claim Button */}
                      <button
                        onClick={() => setClaimOrder(o)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e0d6c5] hover:bg-[#d6cbba] dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 border border-[#d0c4b1] dark:border-white/10 text-xs font-semibold transition-all shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>แจ้งปัญหา / เคลม</span>
                      </button>
                    </div>

                    {/* Section Label: ข้อมูลสินค้าที่ได้รับ */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>ข้อมูลสินค้าที่ได้รับ</span>
                      </div>

                      {/* High-Contrast Vault Box */}
                      <DeliveredDataViewer
                        deliveredData={o.deliveredData}
                        quantity={o.quantity}
                        onCopiedToast={(msg) => addToast(msg, "info")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {claimOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setClaimOrder(null)} />
            <div className="relative w-full max-w-lg bg-[#f2ebe1] dark:bg-[#12131a] border border-[#e5dcd0] dark:border-white/[0.12] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#dfd4c5] dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                      แจ้งปัญหา / เคลมสินค้า
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      ออเดอร์: {claimOrder.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setClaimOrder(null)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                  หากพบปัญหาสินค้าใช้งานไม่ได้ หรือมีข้อสงสัย
                  คุณสามารถคัดลอกข้อความด้านล่างนี้แล้วส่งให้แอดมินผ่านศูนย์ช่วยเหลือได้ทันทีครับ
                </p>

                <div className="p-3.5 rounded-2xl bg-[#ebe4d7] dark:bg-black/60 border border-[#dfd4c5] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>แบบฟอร์มเคลมสินค้า:</span>
                    <button
                      onClick={() => handleCopyClaim(claimOrder)}
                      className="flex items-center gap-1 text-neutral-900 dark:text-white hover:underline cursor-pointer font-bold"
                    >
                      {claimCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                  <pre className="p-3 rounded-xl bg-white/70 dark:bg-neutral-900/90 border border-neutral-300/60 dark:border-white/[0.06] text-neutral-800 dark:text-neutral-200 font-mono text-[11px] whitespace-pre-wrap break-all select-text leading-relaxed">
                    {getClaimText(claimOrder)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyClaim(claimOrder)}
                  className="flex-1 py-2.5 rounded-xl bg-[#18191f] text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  {claimCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{claimCopied ? "คัดลอกเรียบร้อยแล้ว!" : "คัดลอกข้อความเคลม"}</span>
                </button>
                <Link
                  href="/support"
                  className="px-4 py-2.5 rounded-xl bg-[#e6decf] hover:bg-[#ded5c5] dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
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
