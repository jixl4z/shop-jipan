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

    let { name, slug, icon, description, order } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่จำเป็นต้องกรอก" }, { status: 400 });
    }

    let finalIcon = icon?.trim() || "Package";
    let rawSlug = slug?.trim() || "";

    // If user mistakenly entered an image URL into slug, save it as banner/icon
    if (rawSlug.startsWith("http://") || rawSlug.startsWith("https://") || rawSlug.startsWith("/")) {
      finalIcon = rawSlug;
      rawSlug = "";
    }

    const generatedSlug =
      rawSlug ||
      name.toLowerCase().replace(/[^\u0E00-\u0E7Fa-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const parsedOrder = order !== undefined ? parseInt(String(order), 10) : 0;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        icon: finalIcon,
        description: description?.trim() || "",
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

    let { id, name, slug, icon, description, order } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    let finalIcon = icon !== undefined ? icon.trim() : undefined;
    let rawSlug = slug !== undefined ? slug.trim() : undefined;

    if (rawSlug && (rawSlug.startsWith("http://") || rawSlug.startsWith("https://") || rawSlug.startsWith("/"))) {
      finalIcon = rawSlug;
      rawSlug = undefined;
    }

    const parsedOrder = order !== undefined ? parseInt(String(order), 10) : undefined;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: rawSlug || undefined,
        icon: finalIcon,
        description: description !== undefined ? description.trim() : undefined,
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
