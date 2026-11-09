import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatTimeAgo(dateInput: Date | string): string {
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

  return new Date(dateInput).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

function maskUsername(username?: string | null): string {
  if (!username) return "ลูกค้า***";
  const clean = username.trim();
  if (clean.length <= 2) return `${clean.charAt(0)}***`;
  if (clean.length <= 4) return `${clean.slice(0, 2)}***`;
  return `${clean.slice(0, 3)}***`;
}

export async function GET() {
  try {
    // 100% Real customer orders only - No fake or simulated records
    const realOrders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
      },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    const formattedOrders = realOrders.map((o) => ({
      id: o.id,
      productName: o.productName,
      price: o.totalAmount,
      username: maskUsername(o.user?.username),
      timeAgo: formatTimeAgo(o.createdAt),
    }));

    return NextResponse.json(
      {
        orders: formattedOrders,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
