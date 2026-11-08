import { NextResponse } from "next/server";
import { getCurrentUser, ensureDatabaseSchema } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await ensureDatabaseSchema();

    try {
      const orders = await prisma.order.findMany({
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
          user: { select: { id: true, username: true, email: true } },
          product: { select: { id: true, name: true, image: true } },
        },
        take: 100,
      });

      return NextResponse.json({ orders });
    } catch {
      const orders = await prisma.order.findMany({
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
          user: { select: { id: true, username: true, email: true } },
          product: { select: { id: true, name: true, image: true } },
        },
        take: 100,
      });

      return NextResponse.json({ orders });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
