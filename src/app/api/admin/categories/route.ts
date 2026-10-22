import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    console.error("[Admin Categories GET Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงหมวดหมู่" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { name, slug, icon, description, order } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่จำเป็นต้องกรอก" }, { status: 400 });
    }

    const generatedSlug =
      slug?.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);

    const parsedOrder = order !== undefined ? parseInt(String(order), 10) : 0;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        icon: icon || "Package",
        description: description || "",
        order: Number.isFinite(parsedOrder) ? parsedOrder : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    console.error("[Admin Categories POST Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id, name, slug, icon, description, order } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const parsedOrder = order !== undefined ? parseInt(String(order), 10) : undefined;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        icon,
        description,
        order: parsedOrder !== undefined && Number.isFinite(parsedOrder) ? parsedOrder : undefined,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    console.error("[Admin Categories PUT Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่" }, { status: 500 });
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Admin Categories DELETE Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบหมวดหมู่" }, { status: 500 });
  }
}
