"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { playSuccessChime } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, addToast, setting } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [cfToken, setCfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setErrorMsg(decodeURIComponent(err));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          cfToken: cfToken || "dev-bypass",
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูล");
        setLoading(false);
        return;
      }

      playSuccessChime();
      addToast("เข้าสู่ระบบสำเร็จ!", "success");
      await refreshUser();
      router.push("/");
    } catch {
      setErrorMsg("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[430px] space-y-6 relative z-10">
          {/* Header & Logo Badge */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-lg shadow-rose-600/25 mx-auto ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ยินดีต้อนรับ
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
                เข้าสู่ระบบเพื่อเริ่มต้นใช้งานร้าน
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
                className="w-full px-4 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition-all"
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
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition-all"
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

            {/* Remember Me & Register Link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-neutral-900 border-white/20 text-rose-500 focus:ring-rose-500 focus:ring-offset-0 cursor-pointer accent-rose-500"
                />
                <span className="text-neutral-300 text-xs">จดจำการเข้าสู่ระบบ</span>
              </label>

              <div className="text-neutral-400">
                ยังไม่มีบัญชี?{" "}
                <Link
                  href="/register"
                  className="text-rose-500 hover:text-rose-400 font-semibold transition-colors underline-offset-2 hover:underline"
                >
                  สมัครสมาชิก
                </Link>
              </div>
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
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#ff334b] hover:bg-[#e02b41] active:scale-[0.99] text-white shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Section */}
          <div className="space-y-4 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#060608] px-3 text-neutral-500 font-light">
                  หรือเข้าสู่ระบบด้วย
                </span>
              </div>
            </div>

            {/* Discord SSO Button */}
            <a
              href="/api/auth/discord"
              className="w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              <span>เข้าสู่ระบบด้วย Discord</span>
            </a>
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
