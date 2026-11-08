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

    // 1. Try full select
    try {
      const history = await prisma.topupTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          transactionId: true,
          type: true,
          amount: true,
          transRef: true,
          senderName: true,
          bank: true,
          status: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ history });
    } catch {
      // 2. Fallback to core guaranteed columns
      const history = await prisma.topupTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          transactionId: true,
          type: true,
          amount: true,
          transRef: true,
          status: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ history });
    }
  } catch (err: unknown) {
    console.error("[Topup History Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงประวัติการเติมเงิน" }, { status: 500 });
  }
}
