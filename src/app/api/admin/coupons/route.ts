import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch product names for bound coupons
    const productIds = coupons.map((c) => c.productId).filter(Boolean) as string[];
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const formatted = coupons.map((c) => ({
      ...c,
      productName: c.productId ? productMap.get(c.productId) || null : null,
    }));

    return NextResponse.json({ coupons: formatted });
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

    const body = await req.json();
    const {
      code,
      title,
      description,
      discountType = "PERCENT",
      discountValue,
      minSpend = 0,
      maxDiscount,
      usageLimit,
      productId,
      expiresAt,
      isActive = true,
    } = body;

    if (!code || !title || discountValue === undefined) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคูปอง, ชื่อคูปอง และมูลค่าส่วนลด" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate code
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "รหัสคูปองนี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        title: title.trim(),
        description: description?.trim() || null,
        discountType: discountType === "FIXED" ? "FIXED" : "PERCENT",
        discountValue: Number(discountValue),
        minSpend: Number(minSpend) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        productId: productId?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      code,
      title,
      description,
      discountType,
      discountValue,
      minSpend,
      maxDiscount,
      usageLimit,
      productId,
      expiresAt,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    const cleanCode = code ? code.trim().toUpperCase() : undefined;

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: cleanCode,
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        discountType: discountType !== undefined ? (discountType === "FIXED" ? "FIXED" : "PERCENT") : undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        minSpend: minSpend !== undefined ? Number(minSpend) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        productId: productId !== undefined ? (productId?.trim() || null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
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
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
