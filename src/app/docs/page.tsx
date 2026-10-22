"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import {
  BookOpen,
  CreditCard,
  ShoppingBag,
  Sparkles,
  PackageCheck,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function DocsPage() {
  const { currentTheme, openTopup } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      title: "เติมเงินเข้าสู่กระเป๋า",
      tag: "สแกน QR / ซองของขวัญ",
      desc: "รองรับการโอนผ่านบัญชีธนาคารพร้อมเพย์ (QR PromptPay) มีระบบตรวจสอบสลิปอัตโนมัติของ SlipOK แม่นยำใน 5-10 วินาที หรือกรอกลิงก์ซองของขวัญ TrueMoney Wallet ได้ทันที 24 ชม.",
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      actionText: "ไปหน้าเติมเงิน",
      actionHref: "/topup",
      tips: ["แนบสลิปโอนเงินที่มียอดเงินตรงกับยอดที่ระบุ", "ลิงก์ซองของขวัญต้องตั้งค่าแบบ 'แบ่งเท่ากัน 1 คน'"],
    },
    {
      num: "02",
      title: "เลือกดูและตรวจสอบสินค้า",
      tag: "ตรวจสอบสต็อก & ประกัน",
      desc: "เลือกสินค้าจากหมวดหมู่ต่างๆ เช่น รหัสเกม, บัตรเติมเงิน, แอปพรีเมียม (YouTube, Netflix, Spotify) อ่านรายละเอียดการรับประกันและจำนวนสต็อกคงเหลือที่มีความสดใหม่",
      icon: <ShoppingBag className="w-6 h-6 text-cyan-400" />,
      actionText: "เลือกดูสินค้าทั้งหมด",
      actionHref: "/products",
      tips: ["สังเกตป้าย 'สต็อกพร้อมส่ง' สีเขียว", "อ่านเงื่อนไขการเคลมและวันหมดอายุก่อนตัดสินใจซื้อ"],
    },
    {
      num: "03",
      title: "ยืนยันการสั่งซื้อทันที",
      tag: "ตัดสต็อกอัตโนมัติ 24 ชม.",
      desc: "กดยืนยันสั่งซื้อ ระบบจะทำการหักยอดเครดิตจากกระเป๋าของคุณ และดึงรหัสสินค้าหรือไอดีออกจากคลังสต็อกที่เข้ารหัสความปลอดภัยไว้โดยอัตโนมัติทันที",
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      actionText: "ไปที่หมวดหมู่สินค้า",
      actionHref: "/categories",
      tips: ["หากยอดเงินไม่พอ สามารถกดเติมเงินเพิ่มได้ทันที", "ระบบตัดสต็อกวินาทีต่อวินาที ป้องกันของชนกัน"],
    },
    {
      num: "04",
      title: "รับรหัสสินค้าใน 'คลังของฉัน'",
      tag: "1-Click Copy & บันทึกถาวร",
      desc: "เมื่อสั่งซื้อสำเร็จ รหัสโค้ดหรือบัญชีจะปรากฏขึ้นทันที พร้อมปุ่ม 1-Click Copy ไปใช้งานได้ทันที และข้อมูลทั้งหมดจะถูกบันทึกไว้ในหน้าคำสั่งซื้อของคุณตลอดชีพ",
      icon: <PackageCheck className="w-6 h-6 text-violet-400" />,
      actionText: "เปิดคลังสินค้าของฉัน",
      actionHref: "/orders",
      tips: ["กดปุ่มคัดลอกเพื่อนำรหัสไปใช้ได้สะดวกรวดเร็ว", "หากสินค้ามีปัญหา สามารถกดปุ่ม 'แจ้งปัญหา/เคลม' ได้ทันที"],
    },
  ];

  const faqs = [
    {
      q: "เติมเงินผ่านพร้อมเพย์แล้วเงินไม่เข้า ต้องทำอย่างไร?",
      a: "โดยปกติระบบ SlipOK จะประมวลผลภายใน 5-15 วินาที หากยอดเงินยังไม่เข้า กรุณาตรวจสอบว่าสลิปที่แนบมีความชัดเจน ไม่มีข้อความบัง QR Code ในสลิป หรือติดต่อแอดมินทาง Discord / LINE พร้อมแนบสลิปโอนเงินเพื่อตรวจสอบทันที",
    },
    {
      q: "สินค้ามีรับประกันกี่วัน และครอบคลุมอะไรบ้าง?",
      a: "ระยะเวลารับประกันขึ้นอยู่กับแต่ละสินค้า (ระบุในหน้ารายละเอียดสินค้า) หากรหัสไม่ถูกต้อง เข้าสู่ระบบไม่ได้ หรือถูกตัดการเชื่อมต่อก่อนกำหนด สามารถแจ้งเคลมเปลี่ยนสินค้าชิ้นใหม่ได้ทันทีตลอดระยะเวลารับประกัน",
    },
    {
      q: "ต้องการเคลมสินค้า มีขั้นตอนอย่างไร?",
      a: "1. ไปที่เมนู 'คลังของฉัน (Orders)'\n2. เลือกรหัสสินค้าที่มีปัญหา แล้วกดปุ่ม 'แจ้งปัญหา / เคลมสินค้า'\n3. คัดลอกข้อมูลคำสั่งซื้อแล้วนำไปส่งให้ทีมงานทาง Discord Ticket หรือ LINE เพื่อรับสินค้าใหม่ทันที",
    },
    {
      q: "สามารถสั่งซื้อสินค้าช่วงดึกหรือวันหยุดได้หรือไม่?",
      a: "ได้แน่นอน ระบบของเราเป็นระบบอัตโนมัติเต็มรูปแบบ (Full Automation 24/7) ทั้งการเติมเงินและส่งมอบสินค้า คุณสามารถทำรายการได้ทุกวัน ทุกเวลาตลอด 24 ชั่วโมง",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">คู่มือการใช้งาน (Documentation & Guide)</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>เริ่มต้นใช้งานง่ายๆ ใน 4 ขั้นตอน</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            คู่มือการใช้งานเว็บไซต์ <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">JIPAN STORE</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            เรียนรู้วิธีการเติมเงิน สั่งซื้อสินค้าดิจิทัล และการเข้าดูรหัสสินค้าของคุณในคลังสินค้าอัตโนมัติ 24 ชั่วโมง
          </p>
        </div>

        {/* 4 Steps Timeline / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/90 hover:border-neutral-700 transition-all space-y-4 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-neutral-700 group-hover:text-neutral-500 transition-colors">
                    {s.num}
                  </span>
                </div>

                <div>
                  <div className="inline-block px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-medium text-neutral-400 mb-1.5">
                    {s.tag}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
                  {s.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={s.actionHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  <span>{s.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">คำถามที่พบบ่อย (FAQ)</h2>
            <p className="text-xs text-neutral-400">ข้อสงสัยที่พบบ่อยเกี่ยวกับการทำรายการและการใช้งาน</p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-neutral-900/70 border border-neutral-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-850/50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-neutral-200">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-400 border-t border-neutral-800/60 leading-relaxed whitespace-pre-line">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">ต้องการความช่วยเหลือเพิ่มเติม?</h4>
              <p className="text-xs text-neutral-400">
                หากพบปัญหาหรือมีข้อสงสัย ทีมงานพร้อมซัพพอร์ตตลอด 24 ชั่วโมง
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shrink-0"
          >
            ไปที่ศูนย์ช่วยเหลือ & เคลม
          </Link>
        </div>
      </main>

      <Footer />

      <AuthModal />
      <TopupModal />
      <BuyModal />
    </div>
  );
}
