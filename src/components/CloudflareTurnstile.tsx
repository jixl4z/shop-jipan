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
          theme?: "dark" | "light" | "auto";
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
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black shadow-sm shrink-0">
            <svg
              className="w-3 h-3 stroke-[3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="font-semibold text-neutral-200 text-xs">
            ยืนยันตัวตนแล้ว
          </span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <svg
            className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0"
            viewBox="0 0 24 24"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <div className="leading-tight">
            <div className="font-bold text-[11px] text-neutral-300">
              Cloudflare
            </div>
            <div className="text-[9px] text-neutral-500">นโยบาย · เงื่อนไข</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div ref={containerRef} className="my-1" />
      <span className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1">
        <ShieldCheck className="w-3 h-3 text-neutral-400" />
        <span>ยืนยันตัวตนความปลอดภัย Cloudflare Turnstile</span>
      </span>
    </div>
  );
}
