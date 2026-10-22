import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [
      totalUsers,
      totalOrders,
      ordersAgg,
      topupsAgg,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.topupTransaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          _count: {
            select: { stockItems: { where: { isUsed: false } } },
          },
        },
      }),
    ]);

    const lowStock = lowStockProducts
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        stockCount: p._count.stockItems,
      }))
      .filter((p) => p.stockCount <= 3);

    return NextResponse.json({
      stats: {
        totalSales: ordersAgg._sum.totalAmount || 0,
        totalOrders,
        totalTopups: topupsAgg._sum.amount || 0,
        totalUsers,
      },
      recentOrders,
      lowStock,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
