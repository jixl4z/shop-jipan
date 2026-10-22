"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { Lock, User, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, addToast, currentTheme, setting } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
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
        body: JSON.stringify({ username, password, cfToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      addToast("เข้าสู่ระบบสำเร็จ!", "success");
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
            <h1 className="text-2xl font-bold text-white tracking-tight">เข้าสู่ระบบ</h1>
            <p className="text-xs text-neutral-400">
              เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและเติมเงินเข้ากระเป๋า
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">
                ชื่อผู้ใช้ (Username)
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-medium text-neutral-300">
                  รหัสผ่าน (Password)
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
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
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social OAuth Login (Discord & Google) */}
          <SocialAuthButtons />

          <div className="text-center text-xs text-neutral-400 pt-3">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-400 transition-colors">
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
