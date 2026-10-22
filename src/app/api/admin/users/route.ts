import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        _count: { select: { orders: true, topups: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err: unknown) {
    console.error("[Admin Users GET Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id, role, balanceDelta, newBalance } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) {
      if (role !== "USER" && role !== "ADMIN") {
        return NextResponse.json({ error: "สิทธิ์ผู้ใช้งานไม่ถูกต้อง (USER หรือ ADMIN เท่านั้น)" }, { status: 400 });
      }
      if (id === user.id && role !== "ADMIN") {
        return NextResponse.json(
          { error: "ไม่สามารถลดระดับสิทธิ์แอดมินของบัญชีตัวเองได้ เพื่อป้องกันการถูกล็อกออกจากระบบ" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (newBalance !== undefined) {
      const parsed = Number(newBalance);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10_000_000) {
        return NextResponse.json(
          { error: "ยอดเงินไม่ถูกต้อง (ต้องอยู่ระหว่าง 0 ถึง 10,000,000)" },
          { status: 400 }
        );
      }
      updateData.balance = Number(parsed.toFixed(2));
    } else if (balanceDelta !== undefined) {
      const parsedDelta = Number(balanceDelta);
      if (!Number.isFinite(parsedDelta) || Math.abs(parsedDelta) > 10_000_000) {
        return NextResponse.json({ error: "จำนวนเงินที่ปรับปรุงไม่ถูกต้อง" }, { status: 400 });
      }
      updateData.balance = { increment: Number(parsedDelta.toFixed(2)) };
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        balance: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: unknown) {
    console.error("[Admin Users PUT Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลสมาชิก" }, { status: 500 });
  }
}
