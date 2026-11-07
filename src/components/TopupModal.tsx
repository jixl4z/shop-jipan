"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { getPromptPayQrUrl } from "@/lib/promptpay";
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Copy,
  Gift,
  ArrowRight,
  Landmark,
  Building2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { copyToClipboard } from "@/lib/clipboard";

export default function TopupModal() {
  const { isTopupOpen, closeTopup, setting, refreshUser, updateBalance, addToast, currentTheme } = useStore();

  const [activeTab, setActiveTab] = useState<"promptpay" | "truemoney">("promptpay");

  // PromptPay / Bank Slip states
  const [slipBase64, setSlipBase64] = useState<string>("");
  const [slipPreview, setSlipPreview] = useState<string>("");

  // TrueMoney states
  const [voucherLink, setVoucherLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    amount: number;
    balance: number;
    channel: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isTopupOpen) return null;

  const rawTarget = (setting?.promptPayNumber || "9247611867").trim();
  const accountName = setting?.promptPayName || "จิรกิจ ปานศรี";
  const isCleanPromptPay = /^(0[689]\d{8}|\d{13})$/.test(rawTarget.replace(/[^0-9]/g, ""));
  const isTTB = !isCleanPromptPay || rawTarget.startsWith("924");
  const formattedAccountNumber = rawTarget.length === 10
    ? `${rawTarget.slice(0, 3)}-${rawTarget.slice(3, 4)}-${rawTarget.slice(4, 9)}-${rawTarget.slice(9)}`
    : rawTarget;
  const qrUrl = isCleanPromptPay ? getPromptPayQrUrl(rawTarget) : "";

  const handleCopyAccount = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAccount(true);
      addToast(`คัดลอก ${label} ${text} เรียบร้อยแล้ว`, "success");
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("กรุณาเลือกไฟล์รูปภาพสลิปเท่านั้น");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSlipBase64(result);
      setSlipPreview(result);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  // Submit PromptPay Slip
  const handleSubmitSlip = async () => {
    if (!slipBase64) {
      setErrorMsg("กรุณาแนบรูปภาพสลิปก่อนกดยืนยัน");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/topup/slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slipImage: slipBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "ตรวจสอบสลิปไม่ผ่าน");
        return;
      }

      const creditedAmount = data.transaction?.amount || 0;
      if (typeof data.newBalance === "number") {
        updateBalance(data.newBalance);
      }
      setSuccessInfo({
        amount: creditedAmount,
        balance: data.newBalance,
        channel: isTTB ? "ธนาคารทีเอ็มบีธนชาต (ttb)" : "พร้อมเพย์ (สลิป)",
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      addToast(`เติมเงินสำเร็จ +฿${creditedAmount.toFixed(2)} ยอดเงินเข้ากระเป๋าเรียบร้อยแล้ว`, "success");
      await refreshUser();
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // Submit TrueMoney Angpao Voucher
  const handleSubmitTrueMoney = async () => {
    if (!voucherLink.trim()) {
      setErrorMsg("กรุณากรอกลิงก์ซองของขวัญ TrueMoney Wallet");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/topup/truemoney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherLink }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "รับซองของขวัญไม่สำเร็จ");
        return;
      }

      if (typeof data.newBalance === "number") {
        updateBalance(data.newBalance);
      }
      setSuccessInfo({
        amount: data.amount,
        balance: data.newBalance,
        channel: "TrueMoney Wallet (ซองอั่งเปา)",
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      addToast("เติมเงินผ่าน TrueMoney สำเร็จ!", "success");
      setVoucherLink("");
      await refreshUser();
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessInfo(null);
    setSlipBase64("");
    setSlipPreview("");
    setVoucherLink("");
    setErrorMsg("");
    closeTopup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-neutral-900 border border-neutral-800 p-4 sm:p-6 shadow-2xl z-10 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          // Success State
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">เติมเงินสำเร็จ!</h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              ช่องทาง: <span className="text-neutral-200 font-semibold">{successInfo.channel}</span>
            </p>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-xs mx-auto space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>ยอดเงินที่เติม:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  +฿{successInfo.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                <span>ยอดเงินคงเหลือปัจจุบัน:</span>
                <span className="font-bold text-white font-mono">
                  ฿{successInfo.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg mt-4 ${currentTheme.accent}`}
            >
              เสร็จสิ้น และเริ่มสั่งซื้อสินค้า
            </button>
          </div>
        ) : (
          // Topup Form State
          <div>
            <div className="mb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ระบบอัตโนมัติ 24 ชม.</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                เติมเงินเข้ากระเป๋า (Wallet)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                เลือกช่องทางการชำระเงินที่คุณสะดวก ระบบตรวจสอบยอดเงินอัตโนมัติ
              </p>
            </div>

            {/* Channel Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-950 border border-neutral-800 mb-4 sm:mb-5 gap-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("promptpay");
                }}
                className={`py-2 sm:py-2.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === "promptpay"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Landmark className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{isTTB ? "ธนาคาร TTB" : "สลิปพร้อมเพย์"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("truemoney");
                }}
                className={`py-2 sm:py-2.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === "truemoney"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">ทรูวอเล็ท (อั่งเปา)</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "promptpay" ? (
              // Tab 1: Bank Transfer / PromptPay Slip
              <div>
                {/* Bank / QR Presentation Card */}
                {isTTB ? (
                  <div className="space-y-3 mb-4">
                    {/* Unified Virtual Bank Card */}
                    <div
                      onClick={() => handleCopyAccount(rawTarget, "เลขบัญชี")}
                      className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#0a0c10] via-[#0d0f15] to-[#121118] border border-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-xl group cursor-pointer"
                    >
                      {/* Ambient Bank Gradient Glows (ttb Blue & Orange signature glow) */}
                      <div className="absolute -top-14 -left-14 w-48 h-48 bg-[#0057D9]/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-14 -right-14 w-48 h-48 bg-[#F37021]/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Watermark bank icon background */}
                      <div className="absolute -right-3 -bottom-3 w-32 h-32 text-white/[0.03] group-hover:text-white/[0.05] group-hover:scale-105 transition-all duration-300 pointer-events-none flex items-center justify-center">
                        <Landmark className="w-full h-full stroke-[1]" />
                      </div>

                      <div className="relative z-10 space-y-3.5 sm:space-y-4">
                        {/* Card Top: Bank Brand Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0047BA] via-[#0057D9] to-[#F37021] p-0.5 shadow-md shadow-[#0047BA]/25 shrink-0">
                              <div className="w-full h-full bg-[#08090c] rounded-[14px] flex items-center justify-center">
                                <span className="font-black text-xs sm:text-sm tracking-tighter bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#FB923C] bg-clip-text text-transparent">
                                  ttb
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <h3 className="font-extrabold text-xs sm:text-sm bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#FB923C] bg-clip-text text-transparent tracking-tight">
                                  ธนาคารทีเอ็มบีธนชาต (ttb)
                                </h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 font-mono">
                                  บัญชีร้านค้า
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                                โอนได้ทุกธนาคาร (กสิกร, SCB, กรุงไทย ฯลฯ)
                              </p>
                            </div>
                          </div>

                          {/* Contactless symbol */}
                          <div className="hidden sm:flex items-center opacity-60">
                            <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M4 10a12 12 0 0 1 16 0" />
                              <path d="M7 13a8 8 0 0 1 10 0" />
                              <path d="M10 16a4 4 0 0 1 4 0" />
                            </svg>
                          </div>
                        </div>

                        {/* Card Center: Big Monospace Account Number */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-neutral-400 tracking-wider uppercase">
                              เลขที่บัญชีธนาคาร (แตะเพื่อคัดลอก)
                            </span>
                            <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 transition-colors">
                              คลิกเพื่อคัดลอก
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
                            <span className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-widest select-text">
                              {formattedAccountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyAccount(rawTarget, "เลขบัญชี");
                              }}
                              className={`w-full sm:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                                copiedAccount
                                  ? "bg-white text-black"
                                  : "bg-white/10 hover:bg-white text-white hover:text-black border border-white/20"
                              }`}
                            >
                              {copiedAccount ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>คัดลอกแล้ว!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>คัดลอกเลขบัญชี</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card Bottom: Account Holder */}
                        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                              ชื่อบัญชีผู้รับเงิน
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                              {accountName}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ตรวจสลิปอัตโนมัติ 24 ชม.</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* How-to Notice */}
                    <div className="text-[11px] text-neutral-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] space-y-1">
                      <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>วิธีเติมเงิน:</span>
                      </div>
                      <div>1. โอนเงินเข้าบัญชี <strong className="text-white font-medium">ทีเอ็มบีธนชาต</strong> ด้านบนได้ทุกยอดเงิน (ไม่มีขั้นต่ำ)</div>
                      <div>2. แนบรูปสลิปด้านล่าง ระบบจะตรวจยอดเงินจากสลิปและปรับเงินเข้ากระเป๋าให้อัตโนมัติ 24 ชม.</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="w-36 h-36 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                      <img
                        src={qrUrl}
                        alt="PromptPay QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2 text-center sm:text-left text-xs flex-1">
                      <div className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-1.5">
                        <QrCode className="w-4 h-4 text-white" />
                        <span>พร้อมเพย์ (PromptPay)</span>
                      </div>
                      <div className="text-neutral-400">
                        ชื่อบัญชี: <span className="text-white font-medium">{accountName}</span>
                      </div>
                      <div
                        onClick={() => handleCopyAccount(rawTarget, "หมายเลขพร้อมเพย์")}
                        className="text-neutral-400 flex items-center justify-between font-mono p-2 rounded-xl bg-neutral-900 border border-white/[0.08] hover:border-white/20 cursor-pointer transition-all group"
                        title="คลิกเพื่อคัดลอกเบอร์พร้อมเพย์"
                      >
                        <span className="text-[11px]">หมายเลข:</span>
                        <span className="text-white font-bold select-text">{rawTarget}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 group-hover:bg-white group-hover:text-black text-white text-[10px] font-medium transition-all">
                          คัดลอก
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        * โอนยอดเท่าไหร่ก็ได้ และแนบสลิปด้านล่าง ระบบตรวจสอบทันที
                      </div>
                    </div>
                  </div>
                )}

                {/* Slip Upload Area */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    แนบสลิปการโอนเงิน (Slip Image):
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {slipPreview ? (
                    <div className="relative rounded-2xl bg-neutral-950 border border-white/[0.08] p-3 flex items-center gap-3">
                      <img
                        src={slipPreview}
                        alt="Slip Preview"
                        className="w-14 h-18 object-cover rounded-lg border border-white/[0.1] shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-medium text-white truncate">สลิปพร้อมตรวจสอบ</div>
                        <div className="text-neutral-400 text-[11px] mt-0.5">
                          คลิกปุ่มด้านล่างเพื่อยืนยัน
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlipBase64("");
                          setSlipPreview("");
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] hover:border-white/25 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-950/50 hover:bg-neutral-950"
                    >
                      <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                      <div className="text-xs font-semibold text-neutral-200">
                        คลิกเพื่อเลือกรูปภาพสลิป หรือลากไฟล์มาวางที่นี่
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        รองรับไฟล์ JPG, PNG, WEBP จากทุกธนาคาร
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmitSlip}
                  disabled={loading || !slipBase64}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                    !loading && slipBase64
                      ? "bg-white text-black hover:bg-neutral-200 btn-shine active:scale-95"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังตรวจสอบสลิปกับระบบ SlipOK...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ตรวจสอบสลิป และรับเงินทันที</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Tab 2: TrueMoney Wallet Angpao Voucher
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-300 space-y-2">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>วิธีส่งซองของขวัญ TrueMoney Wallet</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-300 pl-1 leading-relaxed">
                    <li>เปิดแอป <b>TrueMoney</b> ในมือถือของคุณ</li>
                    <li>ไปที่เมนู <b>โอนเงิน</b> &rarr; เลือก <b>ส่งซองของขวัญ (Gift Voucher)</b></li>
                    <li>ระบุจำนวนเงินที่ต้องการเติม</li>
                    <li>เลือกประเภทการสุ่ม: <b>แบ่งจำนวนเงินเท่ากัน</b> และระบุจำนวนคนที่รับ: <b>1 คน</b></li>
                    <li>กดสร้างซอง &rarr; คัดลอกลิงก์ซองของขวัญมาวางในช่องด้านล่าง</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1.5">
                    วางลิงก์ซองของขวัญ TrueMoney:
                  </label>
                  <input
                    type="text"
                    value={voucherLink}
                    onChange={(e) => setVoucherLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>

                <button
                  onClick={handleSubmitTrueMoney}
                  disabled={loading || !voucherLink.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    !loading && voucherLink.trim()
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังดึงเงินจากซอง TrueMoney เข้ากระเป๋า...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>ยืนยันรับเงินจากซอง TrueMoney</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
