import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        options: {
          include: {
            stockItems: {
              where: { isUsed: false },
              select: { id: true },
            },
          },
          orderBy: { order: "asc" },
        },
        stockItems: {
          where: { isUsed: false },
          select: { id: true, optionId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      const optionsFormatted = p.options.map((opt) => ({
        id: opt.id,
        productId: opt.productId,
        name: opt.name,
        price: opt.price,
        originalPrice: opt.originalPrice,
        badge: opt.badge,
        order: opt.order,
        stockCount: opt.stockItems.length,
      }));

      const stockCount = p.hasVariants && p.options.length > 0
        ? optionsFormatted.reduce((acc, curr) => acc + curr.stockCount, 0)
        : p.stockItems.length;

      const { stockItems, ...rest } = p;
      return {
        ...rest,
        options: optionsFormatted,
        stockCount,
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (err: unknown) {
    console.error("[Admin Products GET Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า: ${errorMsg}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      image,
      badge,
      categoryId,
      isRecommended,
      isSuspended,
      hasVariants,
      options,
      initialStock,
    } = data;

    const parsedPrice = Number(price);
    if (!name || typeof name !== "string" || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !categoryId) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อสินค้า, ราคาที่ถูกต้อง (>= 0), และเลือกหมวดหมู่" },
        { status: 400 }
      );
    }

    const parsedOrigPrice =
      originalPrice !== undefined && originalPrice !== null && originalPrice !== ""
        ? Number(originalPrice)
        : null;

    let cleanSlug = (slug?.trim() || name.trim())
      .toLowerCase()
      .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!cleanSlug) {
      cleanSlug = "item";
    }
    const generatedSlug = `${cleanSlug}-${Date.now().toString().slice(-6)}`;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description || "",
        price: Number(parsedPrice.toFixed(2)),
        originalPrice:
          parsedOrigPrice !== null && Number.isFinite(parsedOrigPrice) && parsedOrigPrice >= 0
            ? Number(parsedOrigPrice.toFixed(2))
            : null,
        image: image?.trim() || "",
        badge: badge || null,
        categoryId,
        isRecommended: !!isRecommended,
        isSuspended: !!isSuspended,
        hasVariants: !!hasVariants,
      },
    });

    // Create options if hasVariants
    if (hasVariants && Array.isArray(options) && options.length > 0) {
      await prisma.productOption.createMany({
        data: options.map((opt: any, index: number) => ({
          productId: product.id,
          name: opt.name || `ตัวเลือกที่ ${index + 1}`,
          price: Number(opt.price || parsedPrice),
          originalPrice: opt.originalPrice ? Number(opt.originalPrice) : null,
          badge: opt.badge || null,
          order: opt.order ?? index,
        })),
      });
    }

    // Initial stock (for single product)
    if (!hasVariants && initialStock && typeof initialStock === "string") {
      const lines = initialStock
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0) {
        await prisma.stockItem.createMany({
          data: lines.map((content) => ({
            productId: product.id,
            content,
            isUsed: false,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    console.error("[Admin Products POST Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการสร้างสินค้า: ${errorMsg}` }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const data = await req.json();
    const {
      id,
      name,
      price,
      originalPrice,
      description,
      image,
      badge,
      categoryId,
      isActive,
      isSuspended,
      isRecommended,
      hasVariants,
      options,
    } = data;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    let safePrice: number | undefined = undefined;
    if (price !== undefined) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) {
        return NextResponse.json({ error: "ราคาสินค้าไม่ถูกต้อง" }, { status: 400 });
      }
      safePrice = Number(p.toFixed(2));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: safePrice,
        originalPrice:
          originalPrice !== undefined
            ? originalPrice && Number.isFinite(Number(originalPrice))
              ? Number(Number(originalPrice).toFixed(2))
              : null
            : undefined,
        image,
        badge: badge !== undefined ? badge : undefined,
        categoryId,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        isSuspended: isSuspended !== undefined ? Boolean(isSuspended) : undefined,
        isRecommended: isRecommended !== undefined ? Boolean(isRecommended) : undefined,
        hasVariants: hasVariants !== undefined ? Boolean(hasVariants) : undefined,
      },
    });

    // Update options if provided
    if (options && Array.isArray(options)) {
      const existingOptions = await prisma.productOption.findMany({
        where: { productId: id },
      });
      const incomingIds = options.map((o: any) => o.id).filter(Boolean);

      // Delete options that are not in incoming list
      const toDelete = existingOptions.filter((o) => !incomingIds.includes(o.id));
      if (toDelete.length > 0) {
        await prisma.productOption.deleteMany({
          where: { id: { in: toDelete.map((o) => o.id) } },
        });
      }

      // Upsert incoming options
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (opt.id) {
          await prisma.productOption.update({
            where: { id: opt.id },
            data: {
              name: opt.name,
              price: Number(opt.price),
              originalPrice: opt.originalPrice ? Number(opt.originalPrice) : null,
              badge: opt.badge || null,
              order: opt.order ?? i,
            },
          });
        } else {
          await prisma.productOption.create({
            data: {
              productId: id,
              name: opt.name,
              price: Number(opt.price),
              originalPrice: opt.originalPrice ? Number(opt.originalPrice) : null,
              badge: opt.badge || null,
              order: opt.order ?? i,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    console.error("[Admin Products PUT Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขสินค้า" }, { status: 500 });
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
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Admin Products DELETE Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบสินค้า" }, { status: 500 });
  }
}
