import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    const { id, role, balanceDelta, newBalance, newPassword } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Password reset by admin
    if (newPassword && typeof newPassword === "string" && newPassword.trim() !== "") {
      const trimmedPwd = newPassword.trim();
      if (trimmedPwd.length < 6 || trimmedPwd.length > 128) {
        return NextResponse.json(
          { error: "รหัสผ่านใหม่ต้องมีความยาวระหว่าง 6 ถึง 128 ตัวอักษร" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(trimmedPwd, 10);
    }

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

    return NextResponse.json({ success: true, user: updated, message: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว" });
  } catch (err: unknown) {
    console.error("[Admin Users PUT Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลสมาชิก" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (id === user.id) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีแอดมินของตัวเองได้" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "ลบบัญชีผู้ใช้งานสำเร็จ" });
  } catch (err: unknown) {
    console.error("[Admin Users DELETE Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้งาน" }, { status: 500 });
  }
}
