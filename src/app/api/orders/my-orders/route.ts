import { NextResponse } from "next/server";
import { getCurrentUser, ensureDatabaseSchema } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDatabaseSchema();

    // 1. Try full select with variants and coupon fields
    try {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          productName: true,
          optionName: true,
          price: true,
          quantity: true,
          discountAmount: true,
          couponCode: true,
          totalAmount: true,
          deliveredData: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              image: true,
              slug: true,
            },
          },
        },
        take: 100,
      });

      return NextResponse.json({ orders });
    } catch {
      // 2. Fallback to core guaranteed Order columns
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          productName: true,
          price: true,
          quantity: true,
          totalAmount: true,
          deliveredData: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              image: true,
              slug: true,
            },
          },
        },
        take: 100,
      });

      return NextResponse.json({ orders });
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[my-orders error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
