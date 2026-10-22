"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, Lock, User, Mail, ArrowRight, Loader2 } from "lucide-react";
import CloudflareTurnstile from "./CloudflareTurnstile";
import SocialAuthButtons from "./SocialAuthButtons";

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authTab, openAuth, refreshUser, addToast, currentTheme, setting } =
    useStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (authTab === "register") {
      if (password !== confirmPassword) {
        setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = authTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        authTab === "login"
          ? { username, password, cfToken }
          : { username, email, password, cfToken };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการทำรายการ");
        return;
      }

      addToast(authTab === "login" ? "เข้าสู่ระบบสำเร็จ!" : "สมัครสมาชิกสำเร็จ!", "success");
      await refreshUser();
      closeAuth();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuth}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuth}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Tabs */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3 shadow-lg">
            ⚡
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {authTab === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชีใหม่"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {authTab === "login"
              ? "เข้าสู่ระบบเพื่อสั่งซื้อและเติมเงินในกระเป๋าของคุณ"
              : "สมัครสมาชิกฟรี รับสิทธิประโยชน์และประวัติการสั่งซื้อ"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              openAuth("login");
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              authTab === "login"
                ? "bg-neutral-800 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              openAuth("register");
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              authTab === "register"
                ? "bg-neutral-800 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
          </div>

          {authTab === "register" && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                อีเมล (Email) - ไม่บังคับ
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                รหัสผ่าน (Password)
              </label>
              {authTab === "login" && (
                <a
                  href="/forgot-password"
                  onClick={closeAuth}
                  className="text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  ลืมรหัสผ่าน?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
          </div>

          {authTab === "register" && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                ยืนยันรหัสผ่าน (Confirm Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Cloudflare Turnstile Verification Widget */}
          <CloudflareTurnstile
            enabled={setting?.turnstileEnabled}
            siteKey={setting?.turnstileSiteKey}
            onVerify={(token) => setCfToken(token)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-5 ${currentTheme.accent}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{authTab === "login" ? "เข้าสู่ระบบทันที" : "ยืนยันการสมัครสมาชิก"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* OAuth Social Login (Discord & Google) */}
        <SocialAuthButtons />
      </div>
    </div>
  );
}
