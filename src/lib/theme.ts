export type ThemeColor = "monochrome" | "purple" | "emerald" | "blue" | "crimson" | "amber";

export interface ThemeConfig {
  name: string;
  label: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
  borderActive: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  monochrome: {
    name: "monochrome",
    label: "ขาว-ดำ มินิมอล (Monochrome)",
    accent: "bg-white text-black hover:bg-neutral-200",
    accentHover: "hover:bg-neutral-200",
    accentLight: "bg-neutral-800 text-white",
    badgeBg: "bg-white/10 text-white border-white/20",
    badgeText: "text-white",
    glow: "shadow-[0_0_25px_rgba(255,255,255,0.15)]",
    borderActive: "border-white",
  },
  purple: {
    name: "purple",
    label: "ไซเบอร์ ไวโอเล็ต (Cyber Purple)",
    accent: "bg-violet-600 text-white hover:bg-violet-500",
    accentHover: "hover:bg-violet-500",
    accentLight: "bg-violet-950/60 text-violet-300",
    badgeBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badgeText: "text-violet-400",
    glow: "shadow-[0_0_25px_rgba(139,92,246,0.3)]",
    borderActive: "border-violet-500",
  },
  emerald: {
    name: "emerald",
    label: "เอเมอรัลด์ กรีน (Emerald Neon)",
    accent: "bg-emerald-500 text-black font-semibold hover:bg-emerald-400",
    accentHover: "hover:bg-emerald-400",
    accentLight: "bg-emerald-950/60 text-emerald-300",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badgeText: "text-emerald-400",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    borderActive: "border-emerald-500",
  },
  blue: {
    name: "blue",
    label: "อิเล็กทริก บลู (Electric Cyan)",
    accent: "bg-cyan-500 text-black font-semibold hover:bg-cyan-400",
    accentHover: "hover:bg-cyan-400",
    accentLight: "bg-cyan-950/60 text-cyan-300",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badgeText: "text-cyan-400",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.3)]",
    borderActive: "border-cyan-500",
  },
  crimson: {
    name: "crimson",
    label: "คริมสัน เรด (Crimson Red)",
    accent: "bg-rose-600 text-white hover:bg-rose-500",
    accentHover: "hover:bg-rose-500",
    accentLight: "bg-rose-950/60 text-rose-300",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    badgeText: "text-rose-400",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.3)]",
    borderActive: "border-rose-500",
  },
  amber: {
    name: "amber",
    label: "โกลด์ แอมเบอร์ (Golden Amber)",
    accent: "bg-amber-400 text-black font-semibold hover:bg-amber-300",
    accentHover: "hover:bg-amber-300",
    accentLight: "bg-amber-950/60 text-amber-300",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badgeText: "text-amber-400",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]",
    borderActive: "border-amber-400",
  },
};
