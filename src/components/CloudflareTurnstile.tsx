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
      <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>คุ้มครองความปลอดภัยด้วย Cloudflare SSL & DDoS Protection</span>
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
