"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { triggerRegisterSuccess } from "@/lib/sound";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser, setting } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cfToken, setCfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Success Notification Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Criteria validation
  const hasMinLength = password.length >= 8;
  const isMatch = Boolean(
    password && confirmPassword && password === confirmPassword
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          cfToken: cfToken || "dev-bypass",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "สมัครสมาชิกไม่สำเร็จ");
        setLoading(false);
        return;
      }

      // Success! Play sound chime + speech announcement + confetti + show toast
      setShowSuccessToast(true);
      triggerRegisterSuccess();
      await refreshUser();

      // Smoothly redirect to home page after toast is seen & heard
      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch {
      setErrorMsg("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar />

      {/* Floating Success Toast Alert (Matching genzxshop reference) */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border border-white/10 bg-[#0e1017]/95 backdrop-blur-2xl px-4 py-3.5 shadow-2xl shadow-rose-950/40 flex items-start gap-3.5 min-w-[280px] sm:min-w-[320px]">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-extrabold text-white">สำเร็จ</span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  · Just now
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 font-medium">
                สมัครสมาชิกสำเร็จ
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[430px] space-y-6 relative z-10">
          {/* Header & Logo Badge */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/10 text-white shadow-xl mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                สมัครสมาชิก
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
                สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งานร้าน
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                className="w-full px-4 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Real-time Password Checklist (genzxshop reference) */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  hasMinLength
                    ? "text-emerald-400 font-medium"
                    : "text-neutral-500"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 stroke-[2.5] ${
                    hasMinLength ? "text-emerald-400" : "text-neutral-600"
                  }`}
                />
                <span>ความยาวอย่างน้อย 8 ตัวอักษร</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  isMatch ? "text-emerald-400 font-medium" : "text-neutral-500"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 stroke-[2.5] ${
                    isMatch ? "text-emerald-400" : "text-neutral-600"
                  }`}
                />
                <span>รหัสผ่านทั้งสองช่องตรงกัน</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-xs text-neutral-400 pt-1">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                href="/login"
                className="text-white hover:text-neutral-300 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* Cloudflare Turnstile Box */}
            <div className="pt-1">
              <CloudflareTurnstile
                siteKey={setting?.turnstileSiteKey}
                enabled={setting?.turnstileEnabled}
                onVerify={(tok) => setCfToken(tok)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || showSuccessToast}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-white hover:bg-neutral-200 active:scale-[0.99] text-black shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>สมัครสมาชิก</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Section */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#060608] px-3 text-neutral-500 font-light">
                  หรือสมัครสมาชิกด้วย
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Discord SSO Button */}
              <a
                href="/api/auth/discord"
                className="w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>สมัครสมาชิกด้วย Discord</span>
              </a>

              {/* Google SSO Button */}
              <a
                href="/api/auth/google"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 dark:bg-[#0e1017] dark:hover:bg-[#151722] dark:text-white dark:border-white/10 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>สมัครสมาชิกด้วย Google</span>
              </a>
            </div>
          </div>

          {/* Back to Store Link */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 font-light"
            >
              <span>← กลับหน้าร้าน</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
