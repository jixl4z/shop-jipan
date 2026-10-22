import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const stockItems = await prisma.stockItem.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ stockItems });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { productId, rawStock } = await req.json();

    if (!productId || !rawStock) {
      return NextResponse.json(
        { error: "กรุณาระบุสินค้าและข้อมูลสต็อก" },
        { status: 400 }
      );
    }

    const lines = rawStock
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลสต็อกที่ถูกต้อง" },
        { status: 400 }
      );
    }

    await prisma.stockItem.createMany({
      data: lines.map((content: string) => ({
        productId,
        content,
        isUsed: false,
      })),
    });

    const newTotal = await prisma.stockItem.count({
      where: { productId, isUsed: false },
    });

    return NextResponse.json({
      success: true,
      message: `เพิ่มสต็อกสำเร็จ ${lines.length} รายการ (คงเหลือในระบบ ${newTotal} ชิ้น)`,
      addedCount: lines.length,
      currentUnusedStock: newTotal,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Stock Item ID required" }, { status: 400 });
    }

    await prisma.stockItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
