"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import {
  ShoppingCart,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { openBuyModal, openTopup, currentTheme } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) {
          const found = data.products.find((p: Product) => p.slug === slug);
          setProduct(found || null);
          if (found) {
            const related = data.products.filter(
              (p: Product) => p.id !== found.id && p.category?.slug === found.category?.slug
            );
            setRelatedProducts(related.slice(0, 4));
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
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
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-bold">ไม่พบสินค้านี้</h1>
          <p className="text-xs text-neutral-400">สินค้านี้อาจถูกลบหรือเปลี่ยนชื่อไปแล้ว</p>
          <Link
            href="/products"
            className="inline-block px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold"
          >
            กลับสู่หน้ารวมสินค้า
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const inStock = product.stockCount > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">
            สินค้าทั้งหมด
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Showcase Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-video sm:aspect-square w-full rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex items-center justify-center">
              {product.image && !product.image.startsWith("/images/") ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-neutral-600">
                  <Package className="w-20 h-20 stroke-[1.2]" />
                  <span className="text-xs font-mono mt-3 tracking-widest text-neutral-500 uppercase">JIPAN GOODS</span>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Features Mini Bar */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                <Zap className="w-4 h-4 text-emerald-400 mx-auto" />
                <div className="font-semibold text-white">จัดส่งทันที</div>
                <div className="text-[10px] text-neutral-400">รับรหัสใน 1 วินาที</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto" />
                <div className="font-semibold text-white">รับประกันแท้ 100%</div>
                <div className="text-[10px] text-neutral-400">ตรวจสอบได้ทุกชิ้น</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                <Clock className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="font-semibold text-white">บริการ 24 ชม.</div>
                <div className="text-[10px] text-neutral-400">สั่งได้ตลอดเวลา</div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="inline-block text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {product.name}
              </h1>

              {/* Stock Status Pill */}
              <div className="flex items-center gap-2 pt-1">
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>พร้อมจำหน่าย ({product.stockCount} ชิ้น)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>สินค้าหมดชั่วคราว</span>
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-neutral-400">ราคาพิเศษ</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black font-mono text-white">
                      ฿{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-neutral-500 line-through font-mono">
                        ฿{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
                    ประหยัด ฿{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => openBuyModal(product)}
                  disabled={!inStock}
                  className={`py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                    inStock
                      ? currentTheme.accent
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/40"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{inStock ? "สั่งซื้อสินค้านี้" : "สินค้าหมด"}</span>
                </button>

                <button
                  onClick={openTopup}
                  className="py-3.5 px-5 rounded-2xl font-semibold text-xs sm:text-sm bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>เติมเงินเข้ากระเป๋า</span>
                </button>
              </div>
            </div>

            {/* Description & Terms */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800/80 space-y-4">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <span>รายละเอียดและคุณสมบัติสินค้า</span>
              </h2>
              <div className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                {product.description || "สินค้าดิจิทัลคุณภาพสูง จัดส่งอัตโนมัติทันทีหลังชำระเงิน"}
              </div>

              {/* Warranty Guarantee Terms Box */}
              <div className="pt-4 border-t border-neutral-800/80 space-y-2 text-xs">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>เงื่อนไขการรับประกันและข้อกำหนด:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] font-light">
                  <li>ระบบจะส่งมอบ Serial Key / บัญชี ให้บนหน้าจอทันทีหลังจากตัดยอดสำเร็จ</li>
                  <li>ข้อมูลสินค้าจะถูกบันทึกไว้ในเมนู &quot;คลังของฉัน&quot; สามารถกลับมาดูซ้ำได้ตลอดเวลา</li>
                  <li>หากพบปัญหาการใช้งาน ติดต่อแอดมินผ่าน LINE Official หรือ Discord ของทางร้าน</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-5 pt-8 border-t border-neutral-900">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              สินค้าอื่นๆ ในหมวดหมู่นี้
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
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
