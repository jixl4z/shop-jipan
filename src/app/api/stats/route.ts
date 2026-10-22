import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalProducts, inStock, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.stockItem.count({ where: { isUsed: false } }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        inStock,
        totalOrders,
      },
    });
  } catch (err) {
    console.error("[Public Stats API Error]:", err);
    return NextResponse.json(
      {
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          inStock: 0,
          totalOrders: 0,
        },
      },
      { status: 200 }
    );
  }
}
