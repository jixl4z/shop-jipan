"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  X,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Wallet,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import DeliveredDataViewer from "./DeliveredDataViewer";

export default function BuyModal() {
  const {
    buyingProduct,
    closeBuyModal,
    user,
    openAuth,
    refreshUser,
    updateBalance,
    addToast,
    openMyOrders,
    currentTheme,
  } = useStore();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Success state with delivered digital keys
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    productName: string;
    optionName?: string | null;
    deliveredData: string;
    quantity: number;
  } | null>(null);

  React.useEffect(() => {
    if (buyingProduct?.hasVariants && buyingProduct.options && buyingProduct.options.length > 0) {
      const inStockOpt = buyingProduct.options.find((o: any) => o.stockCount > 0);
      setSelectedOptionId(inStockOpt ? inStockOpt.id : buyingProduct.options[0].id);
    } else {
      setSelectedOptionId(null);
    }
    setQuantity(1);
    setErrorMsg("");
    setOrderResult(null);
  }, [buyingProduct]);

  if (!buyingProduct) return null;

  const currentOption = buyingProduct.options?.find((o: any) => o.id === selectedOptionId) || null;
  const unitPrice = buyingProduct.hasVariants && currentOption ? currentOption.price : buyingProduct.price;
  const currentStock = buyingProduct.hasVariants && currentOption ? currentOption.stockCount : buyingProduct.stockCount || 0;

  const isSuspended = buyingProduct.isSuspended === true || buyingProduct.isActive === false;
  const inStock = currentStock > 0 && !isSuspended;
  const totalCost = unitPrice * quantity;
  const userBalance = user?.balance || 0;
  const hasEnoughBalance = userBalance >= totalCost;
  const missingAmount = Math.max(0, totalCost - userBalance);
  const maxAvailable = currentStock || 0;

  const handleConfirmPurchase = async () => {
    if (isSuspended) {
      setErrorMsg("สินค้านี้ปิดการขายชั่วคราว ไม่สามารถสั่งซื้อได้");
      return;
    }
    if (!inStock) {
      setErrorMsg("สินค้าหมด รอเติมสต็อก ไม่สามารถสั่งซื้อได้");
      return;
    }
    if (!user) {
      closeBuyModal();
      openAuth("login");
      return;
    }

    if (!hasEnoughBalance) {
      closeBuyModal();
      router.push("/topup");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: buyingProduct.id,
          optionId: selectedOptionId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "สั่งซื้อไม่สำเร็จ");
        return;
      }

      // Success
      setOrderResult({
        orderNumber: data.orderNumber,
        productName: data.productName,
        optionName: data.optionName,
        deliveredData: data.deliveredData,
        quantity,
      });

      // Burst confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (typeof data.newBalance === "number") {
        updateBalance(data.newBalance);
      }
      addToast("สั่งซื้อสำเร็จ! ได้รับข้อมูลสินค้าเรียบร้อยแล้ว", "success");
      await refreshUser();
    } catch {
      setErrorMsg("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderResult(null);
    setQuantity(1);
    setErrorMsg("");
    closeBuyModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-[#0b0c10] border border-white/[0.12] p-4 sm:p-7 shadow-2xl z-10 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {orderResult ? (
          // Success State: Reveal Digital Goods!
          <div className="py-2 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center mx-auto mb-2 text-2xl shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">สั่งซื้อสำเร็จแล้ว!</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                เลขที่คำสั่งซื้อ:{" "}
                <span className="text-white font-mono font-medium">
                  {orderResult.orderNumber}
                </span>
                {orderResult.optionName && (
                  <span className="text-white font-bold ml-1.5">
                    [{orderResult.optionName}]
                  </span>
                )}
              </p>
            </div>

            {/* Smart Delivered Data Viewer (Multi-item separation, no select-all bug, hybrid copy) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-950 border border-white/[0.08]">
              <DeliveredDataViewer
                deliveredData={orderResult.deliveredData}
                quantity={orderResult.quantity}
                onCopiedToast={(msg) => addToast(msg, "info")}
              />

              <p className="text-[11px] text-neutral-500 mt-3 pt-2 border-t border-white/[0.06]">
                * ข้อมูลนี้จะถูกเก็บไว้ในบัญชีของคุณตลอดเวลา สามารถเข้าดูย้อนหลังได้ที่เมนู &quot;คลังของฉัน&quot;
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleClose();
                  openMyOrders();
                }}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                ดูคลังสินค้าของฉัน
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md active:scale-95"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        ) : (
          // Confirmation & Buy Form
          <div>
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 pr-8">
              <img
                src={buyingProduct.image}
                alt={buyingProduct.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border border-neutral-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-neutral-400 font-medium">
                  {buyingProduct.category?.name || "สินค้าดิจิทัล"}
                </div>
                <h3 className="font-bold text-base text-white line-clamp-2 leading-tight">
                  {buyingProduct.name}
                </h3>
                <div className="text-sm font-bold font-mono text-white mt-1">
                  ฿{unitPrice.toFixed(2)} / ชิ้น
                </div>
              </div>
            </div>

            {/* Options Selection */}
            {buyingProduct.hasVariants && buyingProduct.options && buyingProduct.options.length > 0 && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">เลือกตัวเลือกสินค้า:</label>
                <div className="grid grid-cols-2 gap-2">
                  {buyingProduct.options.map((opt: any) => {
                    const isSelected = selectedOptionId === opt.id;
                    const optInStock = opt.stockCount > 0;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/10 border-white ring-1 ring-white/50 text-white"
                            : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="font-bold text-xs truncate">
                          {opt.name} {opt.badge && <span>{opt.badge}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-white font-mono font-bold">฿{opt.price.toFixed(0)}</span>
                          <span className={optInStock ? "text-neutral-400" : "text-neutral-400 font-medium"}>
                            {optInStock ? `เหลือ ${opt.stockCount}` : "หมด"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 mb-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>จำนวนที่ต้องการซื้อ:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center font-bold text-sm disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    disabled={quantity >= maxAvailable}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center font-bold text-sm disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-850">
                <span>คงเหลือในสต็อก:</span>
                <span className="font-medium text-neutral-200">{maxAvailable} ชิ้น</span>
              </div>

              <div className="flex justify-between items-center text-xs text-neutral-400 pt-1">
                <span>ยอดรวมทั้งหมด:</span>
                <span className="text-base font-bold text-white font-mono">
                  ฿{totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Wallet Balance Check */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-white/[0.08] mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-white" />
                  <span className="text-neutral-400">ยอดเงินในกระเป๋าของคุณ:</span>
                </div>
                <div className="font-mono font-bold text-white">
                  ฿{userBalance.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="mb-5 p-3.5 rounded-2xl bg-neutral-950 border border-white/[0.08] text-center text-xs text-neutral-400">
                คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ
              </div>
            )}

            {/* Action Buttons */}
            {isSuspended ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed text-center"
              >
                สินค้านี้ปิดการขายชั่วคราว
              </button>
            ) : !inStock ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed text-center"
              >
                สินค้าหมด (รอเติมสต็อก)
              </button>
            ) : !user ? (
              <button
                onClick={() => {
                  closeBuyModal();
                  openAuth("login");
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                เข้าสู่ระบบเพื่อสั่งซื้อ
              </button>
            ) : hasEnoughBalance ? (
              <button
                onClick={handleConfirmPurchase}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer bg-white text-black hover:bg-neutral-200 active:scale-95 btn-shine"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>ยืนยันการสั่งซื้อ (ตัดยอด ฿{totalCost.toFixed(2)})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2.5">
                <div className="text-center text-xs text-neutral-400">
                  ยอดเงินไม่เพียงพอ (ขาดอีก <span className="font-mono font-bold text-white">฿{missingAmount.toFixed(2)}</span> บาท)
                </div>
                <button
                  onClick={() => {
                    closeBuyModal();
                    router.push("/topup");
                  }}
                  className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 btn-shine"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เติมเงินทันที (ขาดอีก ฿{missingAmount.toFixed(2)})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
