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
  AlertCircle,
  Loader2,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import confetti from "canvas-confetti";

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
  const { user, setting, refreshUser, openAuth, addToast, currentTheme } = useStore();

  const [activeTab, setActiveTab] = useState<"promptpay" | "truemoney">("promptpay");

  // PromptPay states
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("100");
  const [slipBase64, setSlipBase64] = useState<string>("");
  const [slipPreview, setSlipPreview] = useState<string>("");

  // TrueMoney states
  const [voucherLink, setVoucherLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<TopupHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptPayNumber = setting?.promptPayNumber || "0812345678";
  const promptPayName = setting?.promptPayName || "ร้านค้าทดสอบ";
  const qrUrl = getPromptPayQrUrl(promptPayNumber, amount);

  const PRESETS = [50, 100, 150, 250, 300, 500, 1000];

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

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
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
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "ตรวจสอบสลิปไม่ผ่าน");
        return;
      }

      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      addToast(`เติมเงินสำเร็จ ฿${data.transaction?.amount || amount}`, "success");
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบตรวจสอบยอดเงินอัตโนมัติ 24 ชม.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Wallet className="w-7 h-7 text-emerald-400" />
              <span>เติมเงินเข้ากระเป๋าตังค์ (Top-up Wallet)</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-light">
              เติมเงินสะดวก รวดเร็ว ทั้งสแกนสลิปพร้อมเพย์ และซองอั่งเปา TrueMoney Wallet
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-4 shrink-0 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
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
          <div className="lg:col-span-7 rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("promptpay");
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "promptpay"
                    ? "bg-neutral-800 text-white shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>สลิปพร้อมเพย์ (SlipOK)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("truemoney");
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "truemoney"
                    ? "bg-neutral-800 text-white shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>ทรูวอเล็ท (ซองอั่งเปา)</span>
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
              <div className="p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-850 space-y-3">
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
              <div className="space-y-5">
                {/* Amount presets */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    เลือกจำนวนเงินที่ต้องการโอน:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleSelectAmount(p)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          amount === p
                            ? "bg-white text-black shadow-md scale-105"
                            : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-600"
                        }`}
                      >
                        ฿{p}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500 font-mono">
                      ฿
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customAmount}
                      onChange={handleCustomChange}
                      placeholder="หรือระบุจำนวนเงินที่ต้องการ"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-500 font-mono"
                    />
                  </div>
                </div>

                {/* QR Code Presentation Box */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shrink-0 flex items-center justify-center shadow-md">
                    <img
                      src={qrUrl}
                      alt="PromptPay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 text-center sm:text-left text-xs">
                    <div className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>สแกนจ่ายด้วยพร้อมเพย์</span>
                    </div>
                    <div className="text-neutral-400">
                      ชื่อบัญชี:{" "}
                      <span className="text-neutral-200 font-medium">{promptPayName}</span>
                    </div>
                    <div className="text-neutral-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
                      หมายเลข: <span className="text-white font-bold">{promptPayNumber}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(promptPayNumber);
                          addToast("คัดลอกหมายเลขพร้อมเพย์แล้ว", "info");
                        }}
                        className="p-1 hover:text-white text-neutral-400 transition-colors cursor-pointer"
                        title="คัดลอกเบอร์พร้อมเพย์"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-neutral-400">
                      ยอดที่ต้องโอน:{" "}
                      <span className="text-emerald-400 font-bold font-mono text-base">
                        ฿{amount.toFixed(2)} บาท
                      </span>
                    </div>
                  </div>
                </div>

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
                    <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-3.5 flex items-center gap-3">
                      <img
                        src={slipPreview}
                        alt="Slip Preview"
                        className="w-16 h-20 object-cover rounded-xl border border-neutral-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white truncate">สลิปพร้อมตรวจสอบ</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
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
                      className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-950/60 hover:bg-neutral-950"
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
                      ? currentTheme.accent
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
