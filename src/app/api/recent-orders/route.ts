import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const realOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    const simulated = [
      {
        id: "sim-1",
        productName: "Premium ดูหนัง 30 วัน",
        price: 89,
        username: "moo***",
        timeAgo: "14 นาทีที่แล้ว",
      },
      {
        id: "sim-2",
        productName: "กล่องสุ่ม Diamond ดิจิทัล",
        price: 49,
        username: "bea***",
        timeAgo: "22 นาทีที่แล้ว",
      },
      {
        id: "sim-3",
        productName: "บัตรเติมเงิน 500 Points",
        price: 450,
        username: "kan***",
        timeAgo: "35 นาทีที่แล้ว",
      },
      {
        id: "sim-4",
        productName: "Season Pass พาสเกมยอดฮิต",
        price: 259,
        username: "ton***",
        timeAgo: "1 ชั่วโมงที่แล้ว",
      },
      {
        id: "sim-5",
        productName: "Premium ฟังเพลง Lossless 3 เดือน",
        price: 149,
        username: "pim***",
        timeAgo: "2 ชั่วโมงที่แล้ว",
      },
      {
        id: "sim-6",
        productName: "ไอดีเกมเริ่มต้น 5 ดาว",
        price: 99,
        username: "jam***",
        timeAgo: "3 ชั่วโมงที่แล้ว",
      },
    ];

    if (realOrders.length > 0) {
      const formattedReal = realOrders.map((o) => {
        const u = o.user.username;
        const masked =
          u.length > 3 ? `${u.slice(0, 3)}***` : `${u.slice(0, 1)}***`;
        return {
          id: o.id,
          productName: o.productName,
          price: o.totalAmount,
          username: masked,
          timeAgo: "เมื่อสักครู่",
        };
      });
      return NextResponse.json({
        orders: [...formattedReal, ...simulated].slice(0, 12),
      });
    }

    return NextResponse.json({ orders: simulated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
