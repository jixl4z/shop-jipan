import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

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

import { Kanit } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import FloatingChat from "@/components/FloatingChat";
import RecentSalesToast from "@/components/RecentSalesToast";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const kanit = Kanit({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className={`dark ${kanit.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('jipan_theme_mode');
                  if (m === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${kanit.className} font-sans bg-[#060608] text-neutral-100 min-h-screen antialiased selection:bg-white selection:text-black`}>
        <NextTopLoader
          color="#ffffff"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 14px rgba(255,255,255,0.8),0 0 6px rgba(255,255,255,0.6)"
          zIndex={999999}
        />
        <StoreProvider>
          {children}
          <FloatingChat />
          <RecentSalesToast />
          <CookieConsentBanner />
        </StoreProvider>
      </body>
    </html>
  );
}
