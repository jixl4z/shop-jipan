"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import { getPromptPayQrUrl } from "@/lib/promptpay";
import {
  Wallet,
  QrCode,
  Gift,
  Upload,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
  Landmark,
  Building2,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import confetti from "canvas-confetti";
import { copyToClipboard } from "@/lib/clipboard";

interface TopupHistoryItem {
  id: string;
  transactionId: string;
  amount: number;
  transRef?: string;
  type?: string;
  bank?: string;
  status: string;
  createdAt: string;
}

export default function DedicatedTopupPage() {
  const { user, setting, refreshUser, updateBalance, openAuth, addToast, currentTheme } = useStore();

  const [activeTab, setActiveTab] = useState<"promptpay" | "truemoney">("promptpay");

  // PromptPay states
  const [slipBase64, setSlipBase64] = useState<string>("");
  const [slipPreview, setSlipPreview] = useState<string>("");

  // TrueMoney states
  const [voucherLink, setVoucherLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<TopupHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

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

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/topup/history");
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

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

  const handleSubmitSlip = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
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
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      addToast(`เติมเงินสำเร็จ +฿${creditedAmount.toFixed(2)} ยอดเงินเข้ากระเป๋าเรียบร้อยแล้ว`, "success");
      setSlipBase64("");
      setSlipPreview("");
      await refreshUser();
      await loadHistory();
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTrueMoney = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
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
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      addToast(`รับเงินจากซอง TrueMoney สำเร็จ ฿${data.amount}`, "success");
      setVoucherLink("");
      await refreshUser();
      await loadHistory();
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">เติมเงิน (Topup)</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบตรวจสอบยอดเงินอัตโนมัติ 24 ชม.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Wallet className="w-7 h-7 text-white" />
              <span>เติมเงินเข้ากระเป๋าตังค์ (Top-up Wallet)</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              เติมเงินสะดวก รวดเร็ว ทั้งสแกนสลิปพร้อมเพย์ และซองอั่งเปา TrueMoney Wallet
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-white/[0.08] flex items-center gap-4 shrink-0 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center font-bold text-lg">
              ฿
            </div>
            <div>
              <div className="text-[11px] text-neutral-400">ยอดเงินคงเหลือปัจจุบัน</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white">
                ฿{user ? user.balance.toFixed(2) : "0.00"}
              </div>
            </div>
          </div>
        </div>

        {/* Topup Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Topup Box */}
          <div className="lg:col-span-7 rounded-3xl bg-neutral-900/80 border border-white/[0.08] p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-950 border border-white/[0.08] gap-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("promptpay");
                }}
                className={`py-2.5 sm:py-3 px-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === "promptpay"
                    ? "bg-white text-black shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Landmark className="w-4 h-4 shrink-0" />
                <span className="truncate">{isTTB ? "ธนาคาร TTB" : "สลิปพร้อมเพย์"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("truemoney");
                }}
                className={`py-2.5 sm:py-3 px-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === "truemoney"
                    ? "bg-white text-black shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span className="truncate">ทรูวอเล็ท (อั่งเปา)</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-4 py-3 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!user ? (
              <div className="p-6 sm:p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-850 space-y-3">
                <Wallet className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="font-bold text-sm text-neutral-200">
                  กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  เข้าสู่ระบบเพื่อผูกยอดเงินเข้ากับบัญชีของคุณ หรือสร้างบัญชีใหม่ฟรี
                </p>
                <button
                  onClick={() => openAuth("login")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg ${currentTheme.accent}`}
                >
                  เข้าสู่ระบบทันที
                </button>
              </div>
            ) : activeTab === "promptpay" ? (
              // PromptPay Tab
              <div className="space-y-4 sm:space-y-5">
                {/* Bank / QR Presentation Box */}
                {isTTB ? (
                  <div className="space-y-3.5">
                    {/* Unified Virtual Bank Card */}
                    <div
                      onClick={() => handleCopyAccount(rawTarget, "เลขบัญชี")}
                      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0a0c10] via-[#0d0f15] to-[#121118] border border-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-2xl group cursor-pointer"
                    >
                      {/* Ambient Bank Gradient Glows (ttb Blue & Orange signature glow) */}
                      <div className="absolute -top-16 -left-16 w-52 h-52 bg-[#0057D9]/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-[#F37021]/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Watermark bank icon background */}
                      <div className="absolute -right-4 -bottom-4 w-36 h-36 text-white/[0.03] group-hover:text-white/[0.05] group-hover:scale-105 transition-all duration-300 pointer-events-none flex items-center justify-center">
                        <Landmark className="w-full h-full stroke-[1]" />
                      </div>

                      <div className="relative z-10 space-y-4 sm:space-y-5">
                        {/* Card Top: Bank Brand Header */}
                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08]">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0047BA] via-[#0057D9] to-[#F37021] p-0.5 shadow-md shadow-[#0047BA]/25 shrink-0">
                              <div className="w-full h-full bg-[#08090c] rounded-[14px] flex items-center justify-center">
                                <span className="font-black text-sm tracking-tighter bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#FB923C] bg-clip-text text-transparent">
                                  ttb
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#FB923C] bg-clip-text text-transparent tracking-tight">
                                  ธนาคารทีเอ็มบีธนชาต (ttb)
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 font-mono">
                                  บัญชีร้านค้า
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                โอนได้ทุกธนาคาร (กสิกร, SCB, กรุงไทย ฯลฯ) ไม่มีขั้นต่ำ
                              </p>
                            </div>
                          </div>

                          {/* Contactless symbol */}
                          <div className="hidden sm:flex items-center opacity-60">
                            <svg className="w-6 h-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M4 10a12 12 0 0 1 16 0" />
                              <path d="M7 13a8 8 0 0 1 10 0" />
                              <path d="M10 16a4 4 0 0 1 4 0" />
                            </svg>
                          </div>
                        </div>

                        {/* Card Center: Big Monospace Account Number */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 tracking-wider uppercase">
                              เลขที่บัญชีธนาคาร (แตะเพื่อคัดลอก)
                            </span>
                            <span className="text-[11px] text-neutral-500 group-hover:text-neutral-300 transition-colors">
                              คลิกเพื่อคัดลอก
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-widest select-text">
                              {formattedAccountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyAccount(rawTarget, "เลขบัญชี");
                              }}
                              className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                                copiedAccount
                                  ? "bg-white text-black"
                                  : "bg-white/10 hover:bg-white text-white hover:text-black border border-white/20"
                              }`}
                            >
                              {copiedAccount ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>คัดลอกแล้ว!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>คัดลอกเลขบัญชี</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card Bottom: Account Holder */}
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                              ชื่อบัญชีผู้รับเงิน
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                              {accountName}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ตรวจสลิปอัตโนมัติ 24 ชม.</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* How-to Notice */}
                    <div className="text-xs text-neutral-400 bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-white/[0.06] space-y-1">
                      <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>วิธีเติมเงิน:</span>
                      </div>
                      <div>1. โอนเงินเข้าบัญชี <strong className="text-white font-medium">ทีเอ็มบีธนชาต</strong> ด้านบนได้ทุกยอดเงิน (ไม่มีขั้นต่ำ)</div>
                      <div>2. แนบรูปสลิปด้านล่าง ระบบจะตรวจยอดเงินจากสลิปและปรับเงินเข้ากระเป๋าให้อัตโนมัติ 24 ชม.</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shrink-0 flex items-center justify-center shadow-md">
                      <img
                        src={qrUrl}
                        alt="PromptPay QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2.5 text-center sm:text-left text-xs flex-1">
                      <div className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-1.5">
                        <QrCode className="w-4 h-4 text-white" />
                        <span>สแกนจ่ายด้วยพร้อมเพย์</span>
                      </div>
                      <div className="text-neutral-400">
                        ชื่อบัญชี:{" "}
                        <span className="text-white font-medium">{accountName}</span>
                      </div>
                      <div
                        onClick={() => handleCopyAccount(rawTarget, "หมายเลขพร้อมเพย์")}
                        className="text-neutral-400 flex items-center justify-between font-mono p-2.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:border-white/20 cursor-pointer transition-all group"
                        title="คลิกเพื่อคัดลอกเบอร์พร้อมเพย์"
                      >
                        <span className="text-[11px]">หมายเลข:</span>
                        <span className="text-white font-bold select-text text-sm">{rawTarget}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 group-hover:bg-white group-hover:text-black text-white text-[11px] font-medium transition-all">
                          คัดลอก
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        * สามารถโอนได้ทุกยอดเงิน แล้วแนบสลิปด้านล่าง
                      </div>
                    </div>
                  </div>
                )}

                {/* Slip Upload Area */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    แนบรูปภาพสลิปการโอนเงิน (สลิป SlipOK):
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {slipPreview ? (
                    <div className="relative rounded-2xl bg-neutral-950 border border-white/[0.08] p-3.5 flex items-center gap-3">
                      <img
                        src={slipPreview}
                        alt="Slip Preview"
                        className="w-16 h-20 object-cover rounded-xl border border-white/[0.1] shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white truncate">สลิปพร้อมตรวจสอบ</div>
                        <div className="text-neutral-400 text-[11px] mt-0.5">
                          คลิกปุ่มด้านล่างเพื่อยืนยันการเติมเงิน
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlipBase64("");
                          setSlipPreview("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] hover:border-white/25 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-950/60 hover:bg-neutral-950"
                    >
                      <Upload className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-neutral-200">
                        คลิกเพื่อเลือกไฟล์รูปภาพสลิป หรือลากไฟล์มาวาง
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
                      <span>ตรวจสอบสลิป และรับเงินเข้ากระเป๋าทันที</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // TrueMoney Tab
              <div className="space-y-5 text-xs">
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-300 space-y-2.5">
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>วิธีส่งซองของขวัญ TrueMoney Wallet</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-300 pl-1 leading-relaxed">
                    <li>เปิดแอป <b>TrueMoney</b> ในโทรศัพท์มือถือของคุณ</li>
                    <li>ไปที่เมนู <b>โอนเงิน</b> &rarr; เลือก <b>ส่งซองของขวัญ (Gift Voucher)</b></li>
                    <li>ระบุจำนวนเงินที่ต้องการเติม (เช่น 50, 100, 300 บาท)</li>
                    <li>เลือกประเภทการสุ่ม: <b>แบ่งจำนวนเงินเท่ากัน</b> และระบุจำนวนคนที่รับ: <b>1 คน</b></li>
                    <li>กดสร้างซอง &rarr; คัดลอกลิงก์ซองของขวัญมาวางในช่องด้านล่างนี้</li>
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
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
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

          {/* Right Column: Past Topups History */}
          <div className="lg:col-span-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>ประวัติการเติมเงินของคุณ</span>
            </h2>

            {loadingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังโหลดประวัติ...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs space-y-1">
                <div>ยังไม่มีประวัติการเติมเงิน</div>
                <div className="text-[11px] text-neutral-600">
                  เมื่อคุณเติมเงิน รายการจะแสดงที่นี่
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {h.type === "TRUEMONEY" ? "TrueMoney Wallet" : "สลิปพร้อมเพย์"}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {new Date(h.createdAt).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        +฿{h.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">สำเร็จ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
