"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { Lock, User, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser, addToast, currentTheme, setting } = useStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, cfToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      addToast("สมัครสมาชิกสำเร็จ!", "success");
      await refreshUser();
      router.push("/");
    } catch {
      setErrorMsg("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl mx-auto shadow-lg">
              ⚡
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">สร้างบัญชีใหม่</h1>
            <p className="text-xs text-neutral-400">
              สมัครสมาชิกฟรีเพื่อเริ่มต้นสั่งซื้อและเติมเงิน
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                ชื่อผู้ใช้ (Username) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น somchai2026"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                อีเมล (Email) - ไม่บังคับ
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                รหัสผ่าน (Password) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                ยืนยันรหัสผ่าน *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            <CloudflareTurnstile
              enabled={setting?.turnstileEnabled}
              siteKey={setting?.turnstileSiteKey}
              onVerify={(token) => setCfToken(token)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${currentTheme.accent}`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>ยืนยันการสมัครสมาชิก</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social OAuth Login (Discord & Google) */}
          <SocialAuthButtons />

          <div className="text-center text-xs text-neutral-400 pt-3">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-400 transition-colors">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
