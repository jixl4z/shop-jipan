"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import BuyModal from "@/components/BuyModal";
import MyOrdersModal from "@/components/MyOrdersModal";
import {
  Wallet,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Shield,
  Upload,
  ChevronDown,
  ChevronUp,
  CreditCard,
  X,
  FileText,
  Gift,
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

// Custom SVGs matching the reference UI perfectly
function BankSlipIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <rect x="4" y="2" width="28" height="32" rx="4" fill="#1e2029" stroke="#374151" strokeWidth="1.5" />
        <rect x="8" y="7" width="12" height="12" rx="2" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1" />
        <rect x="11" y="10" width="6" height="6" fill="#38bdf8" />
        <line x1="23" y1="8" x2="28" y2="8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="12" x2="28" y2="12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="16" x2="27" y2="16" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="23" x2="28" y2="23" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="27" x2="22" y2="27" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="26" cy="27" r="2.5" fill="#10b981" />
      </svg>
    </div>
  );
}

function TrueMoneyEnvelopeIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <rect x="3" y="4" width="30" height="28" rx="5" fill="#dc2626" />
        <path d="M3 8L18 20L33 8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="20" r="4.5" fill="#fbbf24" />
        <circle cx="18" cy="20" r="2" fill="#b45309" />
      </svg>
    </div>
  );
}

function RedeemGiftIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <rect x="5" y="13" width="26" height="19" rx="3" fill="#b91c1c" />
        <rect x="3" y="9" width="30" height="6" rx="2" fill="#ef4444" />
        <rect x="15" y="9" width="6" height="23" fill="#fbbf24" />
        <path d="M12 9C12 9 12 5 15 5C17.5 5 17.5 9 17.5 9" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 9C24 9 24 5 21 5C18.5 5 18.5 9 18.5 9" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function DedicatedTopupPage() {
  const { user, setting, refreshUser, updateBalance, openAuth, addToast } = useStore();

  // Active payment method
  const [activeMethod, setActiveMethod] = useState<"bank" | "truemoney" | "redeem">("bank");

  // Bank Slip State
  const [slipBase64, setSlipBase64] = useState<string>("");
  const [slipPreview, setSlipPreview] = useState<string>("");
  const [slipFileName, setSlipFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TrueMoney State
  const [voucherLink, setVoucherLink] = useState("");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Redeem Code State
  const [redeemCode, setRedeemCode] = useState("");

  // Common submission states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState<{
    amount: number;
    title: string;
    msg: string;
  } | null>(null);

  // History State
  const [history, setHistory] = useState<TopupHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Bank details from setting
  const rawTarget = (setting?.promptPayNumber || "9247611867").trim();
  const accountName = setting?.promptPayName || "จิรกิจ ปานศรี";
  const formattedAccountNumber =
    rawTarget.length === 10
      ? `${rawTarget.slice(0, 3)}-${rawTarget.slice(3, 4)}-${rawTarget.slice(4, 9)}-${rawTarget.slice(9)}`
      : rawTarget;
  const bankName = rawTarget.startsWith("924")
    ? "ธนาคารทหารไทยธนชาต (TTB)"
    : "ธนาคารกสิกรไทย (KBANK)";

  // Sound effect
  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAccount(true);
      addToast(`คัดลอก ${label} เรียบร้อยแล้ว`, "success");
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handlePasteClipboard = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setter(text.trim());
        addToast("วางข้อมูลจากคลิปบอร์ดแล้ว", "info");
      }
    } catch {
      addToast("กรุณากดอนุญาตการอ่านคลิปบอร์ดในเบราว์เซอร์", "error");
    }
  };

  // Slip file handler
  const handleSlipSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB");
      return;
    }

    setSlipFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setSlipBase64(b64);
      setSlipPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSlipSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearSlip = () => {
    setSlipBase64("");
    setSlipPreview("");
    setSlipFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Bank Slip
  const handleSubmitBankSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth("login");
      return;
    }
    if (!slipBase64) {
      setErrorMsg("กรุณาแนบรูปภาพสลิปโอนเงินก่อนกดยืนยัน");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/topup/slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipImage: slipBase64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "ตรวจสอบสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setSuccessResult({
        amount: data.amount,
        title: "เติมเงินผ่านสลิปสำเร็จ!",
        msg: `ยอดเงิน ฿${data.amount.toFixed(2)} ได้รับการอนุมัติเข้าสู่กระเป๋าแล้ว`,
      });

      playSuccessSound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (typeof data.newBalance === "number") updateBalance(data.newBalance);
      await refreshUser();
      handleClearSlip();
      loadHistory();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Submit TrueMoney Voucher
  const handleSubmitTrueMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth("login");
      return;
    }
    if (!voucherLink.trim()) {
      setErrorMsg("กรุณาระบุลิงก์ซองของขวัญ TrueMoney Wallet");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/topup/truemoney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherLink: voucherLink.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "รับซองของขวัญไม่สำเร็จ");
        return;
      }

      setSuccessResult({
        amount: data.amount,
        title: "รับซองของขวัญสำเร็จ!",
        msg: `ยอดเงิน ฿${data.amount.toFixed(2)} ได้ถูกเพิ่มเข้าบัญชีของคุณแล้ว`,
      });

      playSuccessSound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (typeof data.newBalance === "number") updateBalance(data.newBalance);
      await refreshUser();
      setVoucherLink("");
      loadHistory();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Submit Redeem Code
  const handleSubmitRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth("login");
      return;
    }
    if (!redeemCode.trim()) {
      setErrorMsg("กรุณาระบุรหัส Redeem Code");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/topup/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "รหัสคูปองไม่ถูกต้อง");
        return;
      }

      setSuccessResult({
        amount: data.amount,
        title: "แลกรับโค้ดสำเร็จ!",
        msg: `ยอดเงิน ฿${data.amount.toFixed(2)} ได้ถูกเพิ่มเข้าบัญชีของคุณเรียบร้อยแล้ว`,
      });

      playSuccessSound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (typeof data.newBalance === "number") updateBalance(data.newBalance);
      await refreshUser();
      setRedeemCode("");
      loadHistory();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col selection:bg-rose-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Topup 2-Column Grid Layout matching Reference Screenshots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: User Profile, Balance & Method Selector */}
          <div className="lg:col-span-5 space-y-4">
            {/* User Greeting */}
            <div className="flex items-center gap-3.5 p-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-900 shrink-0 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-rose-700 to-red-500 flex items-center justify-center font-bold text-lg text-white">
                    {user?.username ? user.username.slice(0, 1).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-neutral-400 font-light block leading-none">
                  ยินดีต้อนรับ
                </span>
                <span className="font-extrabold text-sm sm:text-base text-white truncate block mt-1">
                  {user ? user.username : "ผู้เยี่ยมชม (กรุณาเข้าสู่ระบบ)"}
                </span>
              </div>
            </div>

            {/* Current Balance Box */}
            <div className="p-5 rounded-2xl bg-[#0f1015]/80 border border-white/[0.08] space-y-1.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-rose-500" />
                <span>ยอดเงินคงเหลือปัจจุบัน</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-2">
                <span>฿{user ? user.balance.toFixed(2) : "0.00"}</span>
                <span className="text-xs font-normal text-neutral-400 font-sans">บาท</span>
              </div>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-semibold text-neutral-400 block px-1">
                เลือกช่องทางการชำระเงิน
              </label>

              {/* 1. Bank Transfer (แนบสลิป) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod("bank");
                  setErrorMsg("");
                }}
                className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeMethod === "bank"
                    ? "bg-[#181920] border-rose-600 ring-1 ring-rose-600/50 shadow-lg shadow-rose-950/20"
                    : "bg-[#0f1015]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#14151b]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <BankSlipIcon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">โอนผ่านบัญชีธนาคาร</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        แนบสลิป
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      โอนตามเลขบัญชีและอัปโหลดสลิป
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    activeMethod === "bank"
                      ? "bg-rose-600 text-white"
                      : "border-2 border-neutral-700"
                  }`}
                >
                  {activeMethod === "bank" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* 2. TrueMoney Wallet (ซองของขวัญ) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod("truemoney");
                  setErrorMsg("");
                }}
                className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeMethod === "truemoney"
                    ? "bg-[#181920] border-rose-600 ring-1 ring-rose-600/50 shadow-lg shadow-rose-950/20"
                    : "bg-[#0f1015]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#14151b]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <TrueMoneyEnvelopeIcon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">ทรูมันนี่ วอลเล็ท</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        ซองของขวัญ
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      เติมเงินด้วยลิงก์ซองของขวัญ
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    activeMethod === "truemoney"
                      ? "bg-rose-600 text-white"
                      : "border-2 border-neutral-700"
                  }`}
                >
                  {activeMethod === "truemoney" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* 3. Redeem Code (โค้ดเติมเงิน) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod("redeem");
                  setErrorMsg("");
                }}
                className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeMethod === "redeem"
                    ? "bg-[#181920] border-rose-600 ring-1 ring-rose-600/50 shadow-lg shadow-rose-950/20"
                    : "bg-[#0f1015]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#14151b]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <RedeemGiftIcon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">โค้ดเติมเงิน</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400">
                        เข้าทันที
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      แลกรับเงินด้วยรหัสคูปอง
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    activeMethod === "redeem"
                      ? "bg-rose-600 text-white"
                      : "border-2 border-neutral-700"
                  }`}
                >
                  {activeMethod === "redeem" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Bottom 3 Trust Features */}
            <div className="p-4 rounded-2xl bg-[#0f1015]/60 border border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="space-y-1">
                <Shield className="w-4 h-4 text-rose-500 mx-auto" />
                <div className="font-bold text-white text-[11px]">ปลอดภัยสูง</div>
                <div className="text-[10px] text-neutral-500">เข้ารหัสข้อมูล</div>
              </div>
              <div className="space-y-1">
                <Zap className="w-4 h-4 text-rose-500 mx-auto" />
                <div className="font-bold text-white text-[11px]">รวดเร็วทันใจ</div>
                <div className="text-[10px] text-neutral-500">ยอดเข้าอัตโนมัติ</div>
              </div>
              <div className="space-y-1">
                <Clock className="w-4 h-4 text-rose-500 mx-auto" />
                <div className="font-bold text-white text-[11px]">บริการ 24 ชม.</div>
                <div className="text-[10px] text-neutral-500">เติมได้ตลอดเวลา</div>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Payment Method Card */}
          <div className="lg:col-span-7">
            {/* METHOD 1: Bank Account & Slip Upload */}
            {activeMethod === "bank" && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0e0f14] border border-white/[0.08] shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.08]">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <BankSlipIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      โอนผ่านบัญชีธนาคาร (สลิป QR)
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      โอนเงินตามบัญชีด้านล่าง แล้วแนบรูปสลิปเพื่อตรวจสอบ
                    </p>
                  </div>
                </div>

                {/* Bank Account Details Card */}
                <div className="p-5 rounded-2xl bg-[#14151b] border border-white/[0.06] space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 text-[11px] block">ธนาคาร</span>
                      <strong className="text-white font-medium text-xs sm:text-sm mt-0.5 block">
                        {bankName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[11px] block">ชื่อบัญชี</span>
                      <strong className="text-white font-medium text-xs sm:text-sm mt-0.5 block truncate">
                        {accountName}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-medium">
                        เลขที่บัญชี
                      </span>
                      <span className="font-mono font-black text-lg sm:text-xl text-white tracking-wider block mt-0.5">
                        {formattedAccountNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(rawTarget, "เลขที่บัญชี")}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Slip Upload Area */}
                <form onSubmit={handleSubmitBankSlip} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      อัปโหลดรูปภาพสลิปโอนเงิน
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSlipSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {slipPreview ? (
                      <div className="relative p-4 rounded-2xl bg-[#14151b] border border-white/20 flex flex-col items-center justify-center gap-3">
                        <img
                          src={slipPreview}
                          alt="Slip Preview"
                          className="max-h-60 rounded-xl object-contain border border-white/10"
                        />
                        <div className="flex items-center justify-between w-full pt-2 text-xs text-neutral-400 border-t border-white/[0.08]">
                          <span className="truncate max-w-xs">{slipFileName}</span>
                          <button
                            type="button"
                            onClick={handleClearSlip}
                            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                          >
                            ลบรูปภาพ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="py-10 px-4 rounded-2xl bg-[#14151b]/80 hover:bg-[#14151b] border-2 border-dashed border-white/15 hover:border-rose-500/50 transition-all cursor-pointer text-center space-y-2 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-rose-600/10 border border-rose-600/20 text-rose-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          คลิกเพื่อเลือกไฟล์ หรือลากรูปสลิปมาวางที่นี่
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          รองรับรูปภาพ JPG, PNG, WEBP (สูงสุด 10MB)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warning Notice Box */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      กรุณาโอนเงินเข้าบัญชีที่ระบุไว้เท่านั้น และอัปโหลดสลิปที่มี QR Code ชัดเจน ระบบจะตรวจสอบและเติมเงินให้อัตโนมัติ
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading || !slipBase64}
                    className="w-full py-3.5 rounded-xl bg-[#8b2323] hover:bg-[#a62b2b] text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-red-950/30 active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังตรวจสอบสลิปอัตโนมัติ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>ยืนยันการเติมเงิน</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* METHOD 2: TrueMoney Wallet Voucher */}
            {activeMethod === "truemoney" && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0e0f14] border border-white/[0.08] shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.08]">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <TrueMoneyEnvelopeIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      ทรูมันนี่ วอลเล็ท (ซองของขวัญ)
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      สร้างซองของขวัญจาก TrueMoney แล้วนำลิงก์มาวางเพื่อรับเงิน
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTrueMoney} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-2">
                      ลิงก์ซองของขวัญ TrueMoney
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        required
                        value={voucherLink}
                        onChange={(e) => setVoucherLink(e.target.value)}
                        placeholder="https://gift.truemoney.com/campaign/?v=..."
                        className="w-full pl-4 pr-24 py-3 rounded-xl bg-[#14151b] border border-white/[0.08] text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard(setVoucherLink)}
                        className="absolute right-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        วางลิงก์
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-1.5 block">
                      ตัวอย่าง : https://gift.truemoney.com/campaign/?v=XXXXXXXXXXXXXXXX
                    </span>
                  </div>

                  {/* Accordion Guide (3 steps) */}
                  <div className="rounded-xl bg-[#14151b] border border-white/[0.06] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>วิธีสร้างซองของขวัญ TrueMoney (3 ขั้นตอน)</span>
                      {isAccordionOpen ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>

                    {isAccordionOpen && (
                      <div className="p-4 border-t border-white/[0.06] space-y-3 text-neutral-300 text-xs">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                            1
                          </span>
                          <span>
                            เปิดแอป TrueMoney เลือกเมนู <strong>&quot;ส่งซองของขวัญ&quot;</strong> หรือ <strong>&quot;โอนเงิน&quot;</strong>
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                            2
                          </span>
                          <span>
                            ระบุจำนวนเงินที่ต้องการเติม และเลือกจำนวนคนรับเป็น <strong>&quot;1 คน&quot;</strong> (สุ่มจำนวนเงิน หรือ แบ่งจำนวนเงินเท่ากันก็ได้)
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                            3
                          </span>
                          <span>
                            กดสร้างซอง แล้วคัดลอกลิงก์ซองของขวัญ นำมาวางในช่องด้านบนนี้แล้วกดยืนยัน
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading || !voucherLink.trim()}
                    className="w-full py-3.5 rounded-xl bg-[#8b2323] hover:bg-[#a62b2b] text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-red-950/30 active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังตรวจสอบซองของขวัญ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>ยืนยันการเติมเงิน</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* METHOD 3: Redeem Code */}
            {activeMethod === "redeem" && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0e0f14] border border-white/[0.08] shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.08]">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <RedeemGiftIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      โค้ดเติมเงิน (Redeem Code)
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      กรอกรหัสคูปองเพื่อแลกรับเงินเข้าบัญชีทันที
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitRedeemCode} className="space-y-4 text-xs">
                  {/* Notice Box */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/[0.08] text-neutral-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>สามารถรับ Redeem Code ได้จากกิจกรรม หรือโค้ดโปรโมชั่นพิเศษของทางร้าน</span>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-2">
                      รหัสคูปอง
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                        placeholder="เช่น GIFT-XXXX-XXXX หรือ PROMO100"
                        className="w-full pl-4 pr-24 py-3 rounded-xl bg-[#14151b] border border-white/[0.08] text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard((val) => setRedeemCode(val.toUpperCase()))}
                        className="absolute right-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        วางรหัส
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-1.5 block">
                      กรอกรหัสโค้ดให้ถูกต้อง ตัวพิมพ์ใหญ่หรือตัวพิมพ์เล็กสามารถใช้งานได้เหมือนกัน
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading || !redeemCode.trim()}
                    className="w-full py-3.5 rounded-xl bg-[#8b2323] hover:bg-[#a62b2b] text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-red-950/30 active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังตรวจสอบโค้ด...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>ยืนยันการแลกรับเงิน</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Topup History Table */}
        <div className="rounded-3xl bg-[#0e0f14] border border-white/[0.08] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>ประวัติการเติมเงินของคุณ</span>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              disabled={loadingHistory}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              {loadingHistory ? "กำลังโหลด..." : "รีเฟรช"}
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              กำลังโหลดประวัติการเติมเงิน...
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              ยังไม่มีประวัติการทำรายการเติมเงิน
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-neutral-400 border-b border-white/[0.06]">
                    <th className="py-2.5 px-3">วันและเวลา</th>
                    <th className="py-2.5 px-3">ช่องทาง</th>
                    <th className="py-2.5 px-3">จำนวนเงิน</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">
                        {new Date(h.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-medium">
                        {h.type === "SLIP"
                          ? "โอนธนาคาร (สลิป)"
                          : h.type === "TRUEMONEY"
                          ? "ทรูมันนี่ (ซอง)"
                          : "โค้ดเติมเงิน"}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        +฿{h.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            h.status === "SUCCESS"
                              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                              : h.status === "PENDING"
                              ? "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                              : "bg-rose-500/10 border border-rose-500/25 text-rose-400"
                          }`}
                        >
                          {h.status === "SUCCESS" ? "สำเร็จ" : h.status === "PENDING" ? "รอดำเนินการ" : "ไม่สำเร็จ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSuccessResult(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0e0f14] border border-white/20 p-6 space-y-4 shadow-2xl text-center z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">{successResult.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{successResult.msg}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08]">
              <span className="text-xs text-neutral-400 block">ยอดเงินที่ได้รับ</span>
              <span className="font-mono font-black text-2xl text-emerald-400 block mt-0.5">
                +฿{successResult.amount.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessResult(null)}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      <Footer />

      <AuthModal />
      <BuyModal />
      <MyOrdersModal />
    </div>
  );
}
