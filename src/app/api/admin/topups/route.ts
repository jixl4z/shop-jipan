import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const topups = await prisma.topupTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      take: 100,
    });

    return NextResponse.json({ topups });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
