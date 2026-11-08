"use client";

import React, { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "dark" | "light" | "auto";
          size?: "normal" | "flexible" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface CloudflareTurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  enabled?: boolean;
}

export default function CloudflareTurnstile({
  siteKey,
  onVerify,
  enabled,
}: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !siteKey) return;

    // Load Turnstile script if not present
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkAndRender = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    const interval = setInterval(() => {
      if (window.turnstile) {
        checkAndRender();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [siteKey, enabled, onVerify]);

  if (!enabled || !siteKey) {
    return (
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#0e1017] border border-white/10 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-xl bg-white flex items-center justify-center text-black shadow-sm shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-white text-xs block">
              ยืนยันความปลอดภัยแล้ว
            </span>
            <span className="text-[10px] text-neutral-400 font-light">
              ผ่านการตรวจสอบสิทธิ์การเข้าใช้งาน
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-right font-mono text-[10px] text-neutral-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Cloudflare Turnstile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-[#0e1017] border border-white/10 hover:border-white/20 p-2.5 sm:p-3 transition-all shadow-lg overflow-hidden space-y-2">
      {/* Cloudflare Turnstile Widget (with size flexible and rounded corners) */}
      <div className="w-full overflow-hidden rounded-xl bg-[#07080b] flex items-center justify-center min-h-[65px] [&>div]:w-full [&>div]:flex [&>div]:justify-center [&_iframe]:rounded-xl [&_iframe]:border-0">
        <div ref={containerRef} className="w-full flex justify-center" />
      </div>

      {/* Security Brand Footer */}
      <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          <span>ระบบป้องกันและยืนยันตัวตน</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloudflare Turnstile</span>
        </div>
      </div>
    </div>
  );
}
