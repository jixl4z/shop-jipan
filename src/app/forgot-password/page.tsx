"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import { KeyRound, ArrowLeft, Mail, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function ForgotPasswordPage() {
  const { setting, addToast } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      addToast("กรุณากรอกชื่อผู้ใช้หรืออีเมลของคุณ", "error");
      return;
    }
    setSubmitted(true);
    addToast("บันทึกคำขอกู้คืนรหัสผ่านแล้ว! กรุณาติดต่อแอดมินเพื่อยืนยันตัวตน", "success");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 sm:px-6 py-14 w-full space-y-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปหน้าเข้าสู่ระบบ</span>
        </Link>

        <div className="p-7 sm:p-9 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">ลืมรหัสผ่าน?</h1>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              กรอกชื่อผู้ใช้หรืออีเมลที่คุณใช้สมัครสมาชิก เพื่อส่งคำขอกู้คืนรหัสผ่าน
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  ชื่อผู้ใช้ (Username) หรือ อีเมล:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="กรอก username ของคุณ"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
              >
                ส่งคำขอกู้คืนรหัสผ่าน
              </button>
            </form>
          ) : (
            <div className="space-y-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-850 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">รับคำร้องกู้คืนบัญชีเรียบร้อย</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  เนื่องจากเพื่อความปลอดภัยสูงสุดของข้อมูลและยอดเครดิตของคุณ กรุณาทักแชทแอดมินทาง Discord หรือ LINE เพื่อยืนยันตัวตนและรับรหัสผ่านใหม่
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {setting?.contactDiscord && (
                  <a
                    href={setting.contactDiscord}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                  >
                    <span>แจ้งแอดมินทาง Discord</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {setting?.contactLine && (
                  <a
                    href={setting.contactLine}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    <span>แจ้งแอดมินทาง LINE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800/80 text-center text-xs text-neutral-500">
            จำรหัสผ่านได้แล้ว?{" "}
            <Link href="/login" className="text-white hover:underline font-semibold">
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal />
      <TopupModal />
      <BuyModal />
    </div>
  );
}
