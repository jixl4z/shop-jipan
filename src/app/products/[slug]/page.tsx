"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import DeliveredDataViewer from "@/components/DeliveredDataViewer";
import {
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  FileText,
  Ticket,
  Minus,
  Plus,
  ArrowUpRight,
  Info,
  Activity,
  ShoppingBag,
  Globe,
  Loader2,
  X,
  Check,
  Sparkles,
  Wallet,
  Play,
  VideoOff,
  Tag,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useStore } from "@/context/StoreContext";
import ProductCard, { Product, ProductOptionItem } from "@/components/ProductCard";

interface CouponItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  productId?: string | null;
  expiresAt?: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {}

  const { user, openAuth, openTopup, refreshUser, addToast } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);

  // Selection states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    title: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Purchase states
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [successOrder, setSuccessOrder] = useState<{
    orderNumber: string;
    productName: string;
    optionName?: string | null;
    deliveredData: string;
    quantity: number;
    totalAmount: number;
  } | null>(null);

  // Play a pleasant chime upon purchase
  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Fetch product data
  useEffect(() => {
    if (!rawSlug) return;
    setLoading(true);

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) {
          const found = data.products.find((p: Product) => {
            const pSlugDecoded = (() => {
              try {
                return decodeURIComponent(p.slug);
              } catch {
                return p.slug;
              }
            })();
            return (
              p.slug === rawSlug ||
              p.slug === decodedSlug ||
              pSlugDecoded === decodedSlug ||
              pSlugDecoded === rawSlug ||
              p.id === rawSlug ||
              p.id === decodedSlug ||
              p.slug?.toLowerCase() === decodedSlug.toLowerCase() ||
              p.slug?.toLowerCase() === rawSlug.toLowerCase()
            );
          });
          setProduct(found || null);

          // Populate related products from the same category
          if (found && found.category) {
            const related = data.products.filter(
              (p: Product) => p.id !== found.id && p.category?.slug === found.category?.slug
            );
            setRelatedProducts(related);
          } else {
            setRelatedProducts([]);
          }

          // Auto-select first in-stock option if variants exist
          if (found && found.hasVariants && found.options && found.options.length > 0) {
            const inStockOpt = found.options.find((o: ProductOptionItem) => o.stockCount > 0);
            if (inStockOpt) {
              setSelectedOptionId(inStockOpt.id);
            } else {
              setSelectedOptionId(found.options[0].id);
            }
          }

          // Fetch coupons available for this product
          if (found) {
            fetch(`/api/coupons?productId=${found.id}`)
              .then((res) => res.json())
              .then((cData) => {
                if (cData.coupons) {
                  setCoupons(cData.coupons);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [rawSlug, decodedSlug]);

  // Helper to convert YouTube URL to embed format
  const embedVideoUrl = useMemo(() => {
    if (!product?.videoUrl) return null;
    const url = product.videoUrl;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    return null;
  }, [product?.videoUrl]);

  // Derived current option and pricing
  const currentOption = useMemo(() => {
    if (!product || !product.hasVariants || !product.options) return null;
    return product.options.find((o) => o.id === selectedOptionId) || null;
  }, [product, selectedOptionId]);

  const currentUnitPrice = useMemo(() => {
    if (!product) return 0;
    if (product.hasVariants && currentOption) {
      return currentOption.price;
    }
    return product.price;
  }, [product, currentOption]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (product.hasVariants) {
      return currentOption ? currentOption.stockCount : 0;
    }
    return product.stockCount;
  }, [product, currentOption]);

  const isSuspended = product?.isSuspended === true || product?.isActive === false;
  const inStock = currentStock > 0 && !isSuspended;

  // Max selectable quantity
  const maxAvailable = Math.max(1, currentStock || 1);

  // Recalculate subtotal
  const subtotal = useMemo(() => {
    return Number((currentUnitPrice * quantity).toFixed(2));
  }, [currentUnitPrice, quantity]);

  // Recalculate discount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let disc = 0;
    if (appliedCoupon.discountType === "PERCENT") {
      disc = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      disc = appliedCoupon.discountValue;
    }
    return Number(Math.min(disc, subtotal).toFixed(2));
  }, [appliedCoupon, subtotal]);

  const finalTotal = useMemo(() => {
    return Number(Math.max(0, subtotal - discountAmount).toFixed(2));
  }, [subtotal, discountAmount]);

  // Apply Coupon
  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = (codeToUse || couponCodeInput).trim();
    if (!code) {
      setCouponError("กรุณากรอกรหัสคูปองส่วนลด");
      return;
    }
    if (!product) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          productId: product.id,
          optionId: selectedOptionId,
          quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "คูปองไม่ถูกต้อง");
        return;
      }

      setAppliedCoupon({
        code: data.code,
        title: data.title,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
      });
      setCouponCodeInput(data.code);
      addToast(`ใช้คูปอง "${data.code}" สำเร็จ!`, "success");
    } catch {
      setCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
    addToast("ยกเลิกการใช้คูปองแล้ว", "info");
  };

  // Submit purchase
  const handleBuy = async () => {
    if (!product) return;

    if (isSuspended) {
      setOrderError("สินค้านี้ปิดการขายชั่วคราว ไม่สามารถทำการสั่งซื้อได้");
      return;
    }

    if (!inStock) {
      setOrderError("สินค้านี้หมดสต็อก ไม่สามารถทำการสั่งซื้อได้");
      return;
    }

    if (product.hasVariants && !selectedOptionId) {
      setOrderError("กรุณาเลือกตัวเลือกสินค้าก่อนสั่งซื้อ");
      return;
    }

    if (!user) {
      openAuth("login");
      return;
    }

    if (user.balance < finalTotal) {
      setOrderError(`ยอดเงินไม่เพียงพอ (ต้องการ ฿${finalTotal.toFixed(2)} แต่มี ฿${user.balance.toFixed(2)}) กรุณาเติมเงิน`);
      openTopup();
      return;
    }

    setSubmittingOrder(true);
    setOrderError("");

    try {
      const res = await fetch("/api/orders/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          optionId: selectedOptionId,
          quantity,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || "สั่งซื้อสินค้าไม่สำเร็จ");
        return;
      }

      // Success
      setSuccessOrder({
        orderNumber: data.orderNumber,
        productName: data.productName,
        optionName: data.optionName,
        deliveredData: data.deliveredData,
        quantity,
        totalAmount: data.totalAmount,
      });

      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      await refreshUser();
      addToast("สั่งซื้อสำเร็จ! ได้รับข้อมูลสินค้าเรียบร้อยแล้ว", "success");
    } catch {
      setOrderError("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-bold">ไม่พบสินค้านี้</h1>
          <p className="text-xs text-neutral-400">สินค้านี้อาจถูกลบหรือเปลี่ยนชื่อไปแล้ว</p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold"
          >
            กลับสู่หน้ารวมสินค้า
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span className="text-neutral-600">/</span>
          <Link href="/products" className="hover:text-white transition-colors">
            หมวดหมู่สินค้า
          </Link>
          {product.category && (
            <>
              <span className="text-neutral-600">/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-neutral-600">/</span>
          <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* 2-Column Product Layout matching Reference Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image & Info Box */}
          <div className="lg:col-span-5 space-y-4">
            {/* Product Image Box */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/[0.08] flex items-center justify-center shadow-2xl">
              {product.image && !product.image.startsWith("/images/") ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090c] text-white select-none">
                  <span className="font-extrabold italic text-4xl sm:text-5xl tracking-widest text-white/90">
                    1000 X 1000
                  </span>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Video Preview Button (ดูคลิปสินค้า) matching Reference Screenshot */}
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full p-4 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/[0.08] hover:border-white/20 flex items-center justify-between transition-all group cursor-pointer shadow-lg text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">ดูคลิปสินค้า</h4>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                    กดเพื่อดูตัวอย่างแบบวิดีโอ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                <span>ดูคลิปวิดีโอ</span>
                <Play className="w-3 h-3 fill-current" />
              </div>
            </button>

            {/* Product Info Box (ข้อมูลสินค้า) */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">ข้อมูลสินค้า</h4>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                    สถานะและรายละเอียดการจำหน่าย
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-white/[0.06]">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                    <span>หมวดหมู่</span>
                  </span>
                  {product.category ? (
                    <Link
                      href={`/categories/${product.category.slug}`}
                      className="text-neutral-200 hover:text-white flex items-center gap-1 font-medium transition-colors"
                    >
                      <span className="uppercase">{product.category.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                    </Link>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    <span>สถานะ</span>
                  </span>
                  {isSuspended ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>ปิดขายชั่วคราว</span>
                    </span>
                  ) : inStock ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>พร้อมขาย</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>สินค้าหมด</span>
                    </span>
                  )}
                </div>

                {/* Stock Count */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                    <span>คงเหลือ</span>
                  </span>
                  <span className="text-white font-mono font-bold">{currentStock} ชิ้น</span>
                </div>

                {/* Sold Count */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                    <span>ขายไปแล้ว</span>
                  </span>
                  <span className="text-white font-mono font-bold">
                    {(product.soldCount ?? 0).toLocaleString()} ชิ้น
                  </span>
                </div>

                {/* Product Type */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    <span>ประเภทสินค้า</span>
                  </span>
                  <span className="text-neutral-300 font-medium">
                    ระบบจัดส่งอัตโนมัติ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Description, Variants, Coupons, Quantity & Order */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {product.name}
              </h1>
            </div>

            {/* Description Box */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-red-500" />
                <span>รายละเอียดสินค้า</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                {product.description || "สินค้าลิขสิทธิ์แท้ จัดส่งอัตโนมัติผ่านระบบ 24 ชม."}
              </p>
            </div>

            {/* Variants / Options Section */}
            {product.hasVariants && product.options && product.options.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span>เลือกตัวเลือก</span>
                  </div>
                  <span className="text-neutral-500 text-xs font-mono">
                    {product.options.length} ตัวเลือก
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const optInStock = opt.stockCount > 0;

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-white/[0.08] border-white ring-1 ring-white/50 shadow-xl"
                            : "bg-neutral-900/40 border-white/[0.08] hover:border-white/20 hover:bg-neutral-900/60"
                        }`}
                      >
                        {/* Top: Name & Selected Icon */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <span>{opt.name}</span>
                            {opt.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                          )}
                        </div>

                        {/* Bottom: Price & Stock */}
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-white font-extrabold text-sm sm:text-base font-mono">
                            ฿{opt.price.toFixed(0)}
                          </span>
                          {optInStock ? (
                            <span className="text-[11px] text-neutral-400 font-light">
                              เหลือ {opt.stockCount} ชิ้น
                            </span>
                          ) : (
                            <span className="text-[11px] text-red-500 font-bold">
                              หมด
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coupons Section */}
            {coupons.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Ticket className="w-4 h-4 text-white" />
                    <span>คูปองส่วนลดสำหรับสินค้านี้</span>
                  </div>
                  <span className="text-neutral-500 text-xs">
                    {coupons.length} คูปองพร้อมใช้
                  </span>
                </div>

                <div className="space-y-2.5">
                  {coupons.map((c) => {
                    const isApplied = appliedCoupon?.code === c.code;

                    return (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-neutral-900/50 border border-white/[0.08] flex items-center justify-between gap-3 shadow-sm hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Badge */}
                          <div className="px-3 py-2 rounded-xl bg-white text-black font-extrabold text-xs text-center shrink-0">
                            {c.discountType === "PERCENT"
                              ? `ลดพิเศษ ${c.discountValue}%`
                              : `ลด ฿${c.discountValue}`}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white truncate">
                              {c.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {c.minSpend > 0
                                ? `ยอดสั่งซื้อขั้นต่ำ ฿${c.minSpend.toFixed(0)}`
                                : "ไม่มีขั้นต่ำในการสั่งซื้อ"}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                              {c.expiresAt
                                ? `หมดอายุ ${new Date(c.expiresAt).toLocaleDateString("th-TH")}`
                                : "ใช้ได้ไม่จำกัดเวลา"}
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        {isApplied ? (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            ใช้คูปอง
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-bold text-white">จำนวน</label>
              <div className="flex items-center rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-white font-mono font-bold text-xs">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxAvailable}
                  onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Discount Code Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="โค้ดส่วนลด (ถ้ามี)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900/60 border border-white/[0.08] text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors uppercase"
                />
                <button
                  type="button"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "ตรวจสอบ"}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-rose-400 font-light flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <span>
                    ใช้คูปอง <strong>{appliedCoupon.code}</strong> (ลด ฿{discountAmount.toFixed(2)})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    ลบ
                  </button>
                </div>
              )}
            </div>

            {/* Total Price Summary */}
            <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.08]">
              <div>
                <span className="text-xs text-neutral-300 font-bold block">ราคารวมทั้งสิ้น</span>
                <span className="text-[11px] text-neutral-400 font-mono font-light mt-0.5 block">
                  {quantity} ชิ้น × ฿{currentUnitPrice.toFixed(0)}
                  {discountAmount > 0 && ` (ลด ฿${discountAmount.toFixed(2)})`}
                </span>
              </div>
              <div className="text-white font-black text-2xl sm:text-3xl font-mono">
                ฿{finalTotal.toFixed(0)}
              </div>
            </div>

            {orderError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Action Buttons */}
            {isSuspended ? (
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-neutral-500 font-bold text-sm cursor-not-allowed select-none"
              >
                ปิดขายชั่วคราว
              </button>
            ) : !inStock ? (
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-neutral-500 font-bold text-sm cursor-not-allowed select-none flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>สินค้าหมด</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={submittingOrder}
                onClick={handleBuy}
                className="w-full py-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] transition-all cursor-pointer"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>กำลังสั่งซื้อสินค้า...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>สั่งซื้อสินค้า</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Related Products Section matching Reference Screenshot */}
        {relatedProducts.length > 0 && (
          <section className="pt-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>สินค้าอื่นในหมวดหมู่ :</span>
                    <span className="text-red-500 uppercase">
                      {product.category?.name || "ที่เกี่ยวข้อง"}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal font-mono hidden sm:inline">
                      Related Products
                    </span>
                  </h2>
                </div>
              </div>
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                >
                  <span>ดูทั้งหมด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Video Preview Modal matching Reference Screenshot */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0d11] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">ดูคลิปสินค้า</h3>
                  <p className="text-[11px] text-neutral-400 font-light">
                    กดเพื่อดูตัวอย่างแบบวิดีโอ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Body */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] flex items-center justify-center">
              {product?.videoUrl ? (
                embedVideoUrl ? (
                  <iframe
                    src={embedVideoUrl}
                    title={product.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">
                    ยังไม่มีคลิปวิดีโอสำหรับสินค้านี้
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Order Modal with Delivered Digital Keys */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSuccessOrder(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-6 space-y-5 shadow-2xl text-left z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">สั่งซื้อสินค้าสำเร็จ!</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {successOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-1">
              <div className="text-neutral-400">
                สินค้า: <strong className="text-white">{successOrder.productName}</strong>
                {successOrder.optionName && (
                  <span className="text-white ml-1.5 font-bold">[{successOrder.optionName}]</span>
                )}
              </div>
              <div className="text-neutral-400">
                จำนวน: <strong className="text-white">{successOrder.quantity} ชิ้น</strong> | ยอดชำระ:{" "}
                <strong className="text-white font-mono">฿{successOrder.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            {/* Delivered Digital Keys Viewer */}
            <DeliveredDataViewer
              deliveredData={successOrder.deliveredData}
              quantity={successOrder.quantity}
              onCopiedToast={(msg) => addToast(msg, "success")}
            />

            <button
              type="button"
              onClick={() => setSuccessOrder(null)}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      )}

      <Footer />

      <AuthModal />
      <TopupModal />
      <MyOrdersModal />
    </div>
  );
}
