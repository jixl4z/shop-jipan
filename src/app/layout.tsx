import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import FloatingChat from "@/components/FloatingChat";

export const viewport: Viewport = {
  themeColor: "#060608",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shop.jipanlab.com"),
  title: {
    default: "JIPAN STORE — ศูนย์รวมสินค้าดิจิทัลและบริการไอดีเกมระบบอัตโนมัติ 24 ชม.",
    template: "%s | JIPAN STORE",
  },
  description:
    "เว็บขายสินค้าดิจิทัล บัตรเติมเงิน ไอดีเกม และแอปพรีเมียม สแกนจ่ายด้วยสลิปพร้อมเพย์ ระบบตรวจสอบยอดเงินอัตโนมัติ รับของทันที 24 ชั่วโมง",
  keywords: [
    "JIPAN STORE",
    "สินค้าดิจิทัล",
    "ไอดีเกม",
    "บัตรเติมเงิน",
    "สแกนสลิป",
    "พร้อมเพย์",
    "ซื้อไอดีเกม",
    "พรีเมียม",
  ],
  authors: [{ name: "JIPAN STORE" }],
  openGraph: {
    title: "JIPAN STORE — ศูนย์รวมสินค้าดิจิทัลและบริการไอดีเกมระบบอัตโนมัติ 24 ชม.",
    description:
      "เว็บขายสินค้าดิจิทัล บัตรเติมเงิน ไอดีเกม และแอปพรีเมียม สแกนจ่ายด้วยสลิปพร้อมเพย์ รับของทันที 24 ชั่วโมง",
    url: "https://shop.jipanlab.com",
    siteName: "JIPAN STORE",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JIPAN STORE — ศูนย์รวมสินค้าดิจิทัล 24 ชม.",
    description:
      "เว็บขายสินค้าดิจิทัล บัตรเติมเงิน ไอดีเกม และแอปพรีเมียม สแกนจ่ายด้วยสลิปพร้อมเพย์ รับของทันที 24 ชั่วโมง",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060608] text-neutral-100 min-h-screen antialiased selection:bg-white selection:text-black">
        <StoreProvider>
          {children}
          <FloatingChat />
        </StoreProvider>
      </body>
    </html>
  );
}
