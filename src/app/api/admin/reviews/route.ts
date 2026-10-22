import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "ลบรีวิวเรียบร้อยแล้ว" });
  } catch (err: unknown) {
    console.error("[Admin Reviews DELETE Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบรีวิว" },
      { status: 500 }
    );
  }
}
