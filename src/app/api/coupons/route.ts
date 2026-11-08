import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
        ...(productId
          ? {
              OR: [{ productId: null }, { productId }],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const validCoupons = coupons.filter(
      (c) => c.usageLimit === null || c.usedCount < c.usageLimit
    );

    return NextResponse.json({ coupons: validCoupons });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, productId, optionId, quantity = 1 } = body;

    if (!code || typeof code !== "string" || !productId) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคูปองและสินค้า" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "ไม่พบคูปองส่วนลดนี้ หรือคูปองถูกปิดการใช้งาน" },
        { status: 404 }
      );
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "คูปองส่วนลดนี้หมดอายุการใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "คูปองส่วนลดนี้ถูกใช้งานจนครบสิทธิ์แล้ว" },
        { status: 400 }
      );
    }

    // Check product restriction
    if (coupon.productId && coupon.productId !== productId) {
      return NextResponse.json(
        { error: "คูปองนี้ไม่สามารถใช้กับสินค้านี้ได้" },
        { status: 400 }
      );
    }

    // Find product to determine base price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลสินค้า" },
        { status: 404 }
      );
    }

    let unitPrice = product.price;
    if (optionId && product.hasVariants) {
      const opt = product.options.find((o) => o.id === optionId);
      if (opt) {
        unitPrice = opt.price;
      }
    }

    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const subtotal = Number((unitPrice * safeQty).toFixed(2));

    // Check min spend
    if (coupon.minSpend > 0 && subtotal < coupon.minSpend) {
      return NextResponse.json(
        {
          error: `ยอดสั่งซื้อขั้นต่ำสำหรับคูปองนี้คือ ฿${coupon.minSpend.toFixed(2)} (ยอดปัจจุบัน ฿${subtotal.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENT") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Number(discountAmount.toFixed(2));
    const totalAfterDiscount = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      subtotal,
      totalAfterDiscount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
