import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const body = await req.json();
    const avatar = typeof body?.avatar === "string" ? body.avatar.trim() : undefined;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        balance: true,
        avatar: true,
        discordId: true,
        googleId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("[Profile Update Error]:", err);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" }, { status: 500 });
  }
}
