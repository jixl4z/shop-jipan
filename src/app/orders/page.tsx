"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import {
  Package,
  Copy,
  Check,
  Calendar,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  X,
  ExternalLink,
  MessageSquare,
  HelpCircle,
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
  const { user, openAuth, addToast, currentTheme, setting } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("คัดลอกข้อมูลสินค้าแล้ว!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getClaimText = (o: OrderRecord) => {
    return `📌 [แจ้งปัญหา / ขอเคลมสินค้า - JIPAN STORE]
- เลขที่ออเดอร์: ${o.orderNumber}
- สินค้า: ${o.productName} (${o.quantity} ชิ้น)
- สั่งซื้อเมื่อ: ${new Date(o.createdAt).toLocaleString("th-TH")}
- ปัญหาที่พบ: (โปรดระบุ เช่น รหัสเข้าไม่ได้ / หลุดพรีเมียม)
- ข้อมูลรหัสที่ได้รับ: ${o.deliveredData}`;
  };

  const handleCopyClaim = (o: OrderRecord) => {
    navigator.clipboard.writeText(getClaimText(o));
    setClaimCopied(true);
    addToast("คัดลอกข้อความเคลมสินค้าแล้ว! สามารถส่งแอดมินได้ทันที", "success");
    setTimeout(() => setClaimCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">คลังของฉัน (Orders & Inventory)</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Package className="w-7 h-7 text-emerald-400" />
              <span>คลังสินค้าของฉัน (My Inventory)</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              รหัสสินค้าดิจิทัล คีย์เกม และบัญชีทั้งหมดที่คุณสั่งซื้อจะถูกเก็บไว้ที่นี่ตลอดชีพ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>เงื่อนไขการรับประกัน</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>เลือกซื้อสินค้าเพิ่ม</span>
            </Link>
          </div>
        </div>

        {/* Orders List */}
        {!user ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 space-y-3">
            <Package className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-bold text-base text-neutral-200">
              กรุณาเข้าสู่ระบบเพื่อดูคลังสินค้าของคุณ
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              เข้าสู่ระบบด้วยบัญชีที่คุณใช้สั่งซื้อสินค้าเพื่อดูรหัสที่ได้รับ
            </p>
            <button
              onClick={() => openAuth("login")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg ${currentTheme.accent}`}
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        ) : loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>กำลังโหลดรายการสินค้าในคลัง...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 space-y-3">
            <Package className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-bold text-base text-neutral-200">
              ยังไม่มีประวัติการสั่งซื้อ
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              เมื่อคุณสั่งซื้อสินค้า รหัสจะถูกบันทึกไว้ที่นี่ทันที
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              เลือกซื้อสินค้าเลย
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isCopied = copiedId === o.id;
              const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={o.id}
                  className="p-5 sm:p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4 shadow-xl hover:border-neutral-750 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                    <div>
                      <div className="text-xs font-mono text-neutral-500 font-medium">
                        ออเดอร์: {o.orderNumber}
                      </div>
                      <h2 className="font-bold text-base text-white mt-0.5">{o.productName}</h2>
                      <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ฿{o.totalAmount.toFixed(2)} ({o.quantity} ชิ้น)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Claim Button */}
                      <button
                        onClick={() => setClaimOrder(o)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                        title="แจ้งปัญหาหรือเคลมสินค้านี้"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>เคลม / แจ้งปัญหา</span>
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(o.id, o.deliveredData)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-100 text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">คัดลอกเรียบร้อยแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกข้อมูลสินค้า</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Secret Delivered Box */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ข้อมูลรหัส/ไอดีที่ได้รับ:</span>
                    </div>
                    <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-emerald-400 font-mono text-xs sm:text-sm whitespace-pre-wrap break-all select-all leading-relaxed">
                      {o.deliveredData}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Claim Modal */}
        {claimOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setClaimOrder(null)} />
            <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">แจ้งปัญหา / เคลมสินค้า</h3>
                    <p className="text-xs text-neutral-400">
                      ออเดอร์: <span className="font-mono text-neutral-300">{claimOrder.orderNumber}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setClaimOrder(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-1">
                  <div className="text-[11px] text-neutral-400">สินค้าที่ต้องการเคลม:</div>
                  <div className="font-bold text-white text-sm">{claimOrder.productName}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    ยอดชำระ: ฿{claimOrder.totalAmount.toFixed(2)} ({claimOrder.quantity} ชิ้น)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    ข้อความสำหรับส่งแอดมิน:
                  </label>
                  <pre className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 text-neutral-300 font-mono text-[11px] whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto">
                    {getClaimText(claimOrder)}
                  </pre>
                </div>

                <button
                  onClick={() => handleCopyClaim(claimOrder)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs transition-colors cursor-pointer border border-neutral-700"
                >
                  {claimCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกข้อความเคลมแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>1-Click คัดลอกข้อความเคลมทั้งหมด</span>
                    </>
                  )}
                </button>

                <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                  <div className="text-[11px] text-neutral-400 font-medium">
                    ส่งข้อความนี้ให้แอดมินได้ผ่าน 2 ช่องทาง:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {setting?.contactDiscord && (
                      <a
                        href={setting.contactDiscord}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors"
                      >
                        <span>Discord Ticket</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {setting?.contactLine && (
                      <a
                        href={setting.contactLine}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        <span>LINE Official</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
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
