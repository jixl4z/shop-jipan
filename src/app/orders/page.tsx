"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Copy,
  Check,
  ShoppingBag,
  Wallet,
  Receipt,
  CheckCircle2,
  Plus,
  ExternalLink,
  Coins,
  CreditCard,
  Building2,
  Gift,
  KeyRound,
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

interface TopupRecord {
  id: string;
  transactionId: string;
  type: string;
  amount: number;
  transRef?: string | null;
  senderName?: string | null;
  bank?: string | null;
  status: string;
  createdAt: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "topup" ? "topup" : "orders";

  const { user, openAuth, addToast } = useStore();
  const [activeCategory, setActiveCategory] = useState<"orders" | "topup">(initialTab);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [topups, setTopups] = useState<TopupRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingTopups, setLoadingTopups] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedTopup, setSelectedTopup] = useState<TopupRecord | null>(null);
  const [claimOrder, setClaimOrder] = useState<OrderRecord | null>(null);
  const [claimCopied, setClaimCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Sync tab with URL parameter if changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "topup") {
      setActiveCategory("topup");
    } else if (tabParam === "orders") {
      setActiveCategory("orders");
    }
  }, [searchParams]);

  // Fetch orders
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data: any) => {
          if (data && Array.isArray(data.orders)) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    } else {
      setLoadingOrders(false);
    }
  }, [user]);

  // Fetch topup history
  useEffect(() => {
    if (user) {
      setLoadingTopups(true);
      fetch("/api/topup/history")
        .then((res) => res.json())
        .then((data: any) => {
          if (data && Array.isArray(data.history)) setTopups(data.history);
        })
        .catch(() => {})
        .finally(() => setLoadingTopups(false));
    } else {
      setLoadingTopups(false);
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

  const handleCopyOrderNumber = async (num: string) => {
    const ok = await copyToClipboard(num);
    if (ok) {
      setCopiedOrderId(num);
      addToast("คัดลอกเลขที่ออเดอร์เรียบร้อยแล้ว", "success");
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Filtered orders
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

  // Filtered topups
  const filteredTopups = useMemo(() => {
    if (!searchQuery.trim()) return topups;
    const q = searchQuery.toLowerCase().trim();
    return topups.filter(
      (t) =>
        t.transactionId.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.transRef && t.transRef.toLowerCase().includes(q)) ||
        (t.bank && t.bank.toLowerCase().includes(q))
    );
  }, [topups, searchQuery]);

  // Helper for topup type info
  const getTopupTypeBadge = (t: TopupRecord) => {
    switch (t.type.toUpperCase()) {
      case "SLIP":
      case "PROMPTPAY":
        return {
          label: "โอนผ่านธนาคาร",
          icon: <Building2 className="w-4 h-4 text-emerald-400" />,
        };
      case "TRUEMONEY":
        return {
          label: "ทรูมันนี่ วอลเล็ท",
          icon: <Wallet className="w-4 h-4 text-orange-400" />,
        };
      case "REDEEM":
        return {
          label: "โค้ดเติมเงิน",
          icon: <Gift className="w-4 h-4 text-rose-400" />,
        };
      default:
        return {
          label: t.type,
          icon: <CreditCard className="w-4 h-4 text-cyan-400" />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col font-sans selection:bg-[#ff334b] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        {/* Dynamic Header (Exact match to Reference 1 & 2) */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#ff334b]">
            {activeCategory === "orders" ? "ประวัติการสั่งซื้อ" : "ประวัติการเติมเงิน"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            {activeCategory === "orders"
              ? "รายการสั่งซื้อสินค้าและรหัสคีย์ทั้งหมดของคุณ"
              : "บันทึกรายการเติมเงินและประวัติธุรกรรมทั้งหมดของคุณ"}
          </p>
        </div>

        {/* Top Controls Bar (Exact match to Reference 1 & 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Category Switch Pills */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/90 border border-white/[0.08] shadow-inner self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveCategory("orders");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "orders"
                  ? "bg-white/[0.12] text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>การสั่งซื้อ</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-neutral-300 font-mono">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory("topup");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "topup"
                  ? "bg-white/[0.12] text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>การเติมเงิน</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-neutral-300 font-mono">
                {topups.length}
              </span>
            </button>
          </div>

          {/* Search Box on Right */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeCategory === "orders"
                  ? "ค้นหาชื่อสินค้า, รหัสคำสั่งซื้อ..."
                  : "ค้นหาช่องทาง, รหัสธุรกรรม..."
              }
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900/90 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white/25 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {!user ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-950/40 p-12 sm:p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#ff334b] flex items-center justify-center mx-auto shadow-md">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-white">กรุณาเข้าสู่ระบบ</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                เข้าสู่ระบบเพื่อตรวจสอบประวัติการสั่งซื้อและประวัติการเติมเงินของคุณ
              </p>
            </div>
            <button
              onClick={() => openAuth("login")}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#ff334b] hover:bg-[#e02b41] text-white transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        ) : activeCategory === "orders" ? (
          /* =================== ORDERS TAB =================== */
          loadingOrders ? (
            <div className="space-y-2.5 py-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-2xl bg-neutral-900/60 border border-white/[0.06]"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            /* Empty State for Orders (Exact match to Reference 1) */
            <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-950/40 p-12 sm:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#ff334b] flex items-center justify-center mx-auto shadow-md">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">ยังไม่มีรายการสั่งซื้อ</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-light">
                  คุณยังไม่มีประวัติการสั่งซื้อสินค้า เริ่มต้นเลือกดูสินค้าที่น่าสนใจได้เลย
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff334b] hover:bg-[#e02b41] text-white font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ไปเลือกซื้อสินค้าเลย</span>
                </Link>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/40 p-10 text-center space-y-2">
              <Search className="w-7 h-7 text-neutral-500 mx-auto" />
              <div className="text-sm font-semibold text-white">
                ไม่พบคำสั่งซื้อที่ตรงกับ &quot;{searchQuery}&quot;
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-rose-400 underline cursor-pointer"
              >
                ดูคำสั่งซื้อทั้งหมด
              </button>
            </div>
          ) : (
            /* Compact Single-Row Items (ช่องละบรรทัด กดเข้าไปดูรายละเอียดได้) */
            <div className="space-y-2.5">
              {filteredOrders.map((o) => {
                const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#0e1017] hover:bg-[#151722] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    {/* Left: Thumbnail & Order Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        {o.product?.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={o.product.image}
                            alt={o.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-400 font-medium">
                            ออเดอร์: {o.orderNumber}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-rose-400 transition-colors truncate">
                          {o.productName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-light">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price, Qty & Chevron Arrow */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-sm sm:text-base font-mono text-white">
                          ฿{o.totalAmount.toFixed(2)}
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-neutral-400 bg-white/[0.06] px-1.5 py-0.2 rounded font-mono">
                            {o.quantity} ชิ้น
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                            สำเร็จ
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* =================== TOPUP TAB =================== */
          loadingTopups ? (
            <div className="space-y-2.5 py-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-2xl bg-neutral-900/60 border border-white/[0.06]"
                />
              ))}
            </div>
          ) : topups.length === 0 ? (
            /* Empty State for Topup (Exact match to Reference 2) */
            <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-950/40 p-12 sm:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#ff334b] flex items-center justify-center mx-auto shadow-md">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">ยังไม่มีรายการเติมเงิน</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-light">
                  คุณยังไม่มีประวัติการเติมเงิน เติมเงินเข้ากระเป๋าเพื่อใช้ซื้อสินค้าได้ทันที
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/topup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff334b] hover:bg-[#e02b41] text-white font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>เติมเงินเข้ากระเป๋า</span>
                </Link>
              </div>
            </div>
          ) : filteredTopups.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/40 p-10 text-center space-y-2">
              <Search className="w-7 h-7 text-neutral-500 mx-auto" />
              <div className="text-sm font-semibold text-white">
                ไม่พบรายการเติมเงินที่ตรงกับ &quot;{searchQuery}&quot;
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-rose-400 underline cursor-pointer"
              >
                ดูประวัติทั้งหมด
              </button>
            </div>
          ) : (
            /* Compact Single-Row Items for Topup */
            <div className="space-y-2.5">
              {filteredTopups.map((t) => {
                const badge = getTopupTypeBadge(t);
                const formattedDate = new Date(t.createdAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTopup(t)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#0e1017] hover:bg-[#151722] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    {/* Left: Type Icon & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {badge.icon}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-400">
                            รหัส: {t.transactionId}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-rose-400 transition-colors truncate">
                          {badge.label}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-light">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status Badge */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-sm sm:text-base font-mono text-emerald-400">
                          +฿{t.amount.toFixed(2)}
                        </div>
                        <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                          สำเร็จ
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ========================================================
            MODAL 1: ORDER DETAILS POPUP (เด้งดูรายละเอียดว่าซื้ออะไร)
           ======================================================== */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />
            <div className="relative w-full max-w-xl bg-[#0f1016] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-white max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#ff334b] flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">รายละเอียดคำสั่งซื้อ</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400 font-mono">
                        ออเดอร์: {selectedOrder.orderNumber}
                      </span>
                      <button
                        onClick={() => handleCopyOrderNumber(selectedOrder.orderNumber)}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="คัดลอกเลขออเดอร์"
                      >
                        {copiedOrderId === selectedOrder.orderNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info Card */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.06] flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedOrder.product?.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedOrder.product.image}
                      alt={selectedOrder.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-white truncate">
                    {selectedOrder.productName}
                  </h4>
                  <div className="text-xs text-neutral-400 flex items-center gap-2">
                    <span>จำนวน: <strong className="text-white font-mono">{selectedOrder.quantity} ชิ้น</strong></span>
                    <span>•</span>
                    <span>ยอดรวม: <strong className="text-rose-400 font-mono">฿{selectedOrder.totalAmount.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* 4-Stat Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.05] space-y-0.5">
                  <div className="text-[10px] text-neutral-400 font-light">วันที่สั่งซื้อ</div>
                  <div className="font-semibold text-neutral-200 text-[11px] truncate">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("th-TH")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.05] space-y-0.5">
                  <div className="text-[10px] text-neutral-400 font-light">เวลา</div>
                  <div className="font-semibold text-neutral-200 text-[11px] font-mono">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.05] space-y-0.5">
                  <div className="text-[10px] text-neutral-400 font-light">จำนวน</div>
                  <div className="font-semibold text-white font-mono">
                    {selectedOrder.quantity} ชิ้น
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.05] space-y-0.5">
                  <div className="text-[10px] text-neutral-400 font-light">สถานะ</div>
                  <div className="font-bold text-emerald-400 text-[11px]">
                    ✓ สำเร็จ
                  </div>
                </div>
              </div>

              {/* ข้อมูลสินค้าที่ได้รับ (Delivered Data Vault) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ข้อมูลสินค้าที่ได้รับ</span>
                </div>

                <DeliveredDataViewer
                  deliveredData={selectedOrder.deliveredData}
                  quantity={selectedOrder.quantity}
                  onCopiedToast={(msg) => addToast(msg, "info")}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setClaimOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>แจ้งปัญหา / เคลม</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 2: TOPUP DETAILS POPUP (เด้งดูรายละเอียดการเติมเงิน)
           ======================================================== */}
        {selectedTopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setSelectedTopup(null)} />
            <div className="relative w-full max-w-md bg-[#0f1016] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-white">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">รายละเอียดการเติมเงิน</h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {selectedTopup.transactionId}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTopup(null)}
                  className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <div className="text-xs text-emerald-300 font-medium">ยอดเงินที่เข้ากระเป๋า</div>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  +฿{selectedTopup.amount.toFixed(2)}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                  <span className="text-neutral-400">ช่องทางชำระ:</span>
                  <span className="font-bold text-white">
                    {getTopupTypeBadge(selectedTopup).label}
                  </span>
                </div>

                {selectedTopup.transRef && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                    <span className="text-neutral-400">เลขอ้างอิงสลิป:</span>
                    <span className="font-mono text-white select-all">
                      {selectedTopup.transRef}
                    </span>
                  </div>
                )}

                {selectedTopup.bank && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                    <span className="text-neutral-400">ธนาคาร:</span>
                    <span className="font-medium text-white">{selectedTopup.bank}</span>
                  </div>
                )}

                {selectedTopup.senderName && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                    <span className="text-neutral-400">ชื่อผู้โอน:</span>
                    <span className="font-medium text-white">{selectedTopup.senderName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                  <span className="text-neutral-400">วันที่ทำรายการ:</span>
                  <span className="text-neutral-200">
                    {new Date(selectedTopup.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.05]">
                  <span className="text-neutral-400">สถานะ:</span>
                  <span className="font-bold text-emerald-400">สำเร็จ (เติมเงินเข้ากระเป๋าเรียบร้อย)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setSelectedTopup(null)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 3: CLAIM MODAL
           ======================================================== */}
        {claimOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setClaimOrder(null)} />
            <div className="relative w-full max-w-lg bg-[#0f1016] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      แจ้งปัญหา / เคลมสินค้า
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      ออเดอร์: {claimOrder.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setClaimOrder(null)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-neutral-300 leading-relaxed font-light">
                  หากพบปัญหาสินค้าใช้งานไม่ได้ หรือมีข้อสงสัย
                  คุณสามารถคัดลอกข้อความด้านล่างนี้แล้วส่งให้แอดมินผ่านศูนย์ช่วยเหลือได้ทันทีครับ
                </p>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>แบบฟอร์มเคลมสินค้า:</span>
                    <button
                      onClick={() => handleCopyClaim(claimOrder)}
                      className="flex items-center gap-1 text-white hover:underline cursor-pointer font-bold"
                    >
                      {claimCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  <pre className="p-3 rounded-xl bg-neutral-900/90 border border-white/[0.06] text-neutral-200 font-mono text-[11px] whitespace-pre-wrap break-all select-text leading-relaxed">
                    {getClaimText(claimOrder)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyClaim(claimOrder)}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff334b] hover:bg-[#e02b41] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  {claimCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{claimCopied ? "คัดลอกเรียบร้อยแล้ว!" : "คัดลอกข้อความเคลม"}</span>
                </button>
                <Link
                  href="/support"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
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

export default function DedicatedOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060608] text-white flex items-center justify-center">กำลังโหลด...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
