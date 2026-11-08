import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`buy_${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณทำรายการสั่งซื้อถี่เกินไป กรุณารออีก ${rateCheck.resetInSec} วินาที` },
        { status: 429 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ" },
        { status: 401 }
      );
    }

    // Per-user rate limit
    const userRateCheck = checkRateLimit(`buy_user_${user.id}`, 8, 60 * 1000);
    if (!userRateCheck.success) {
      return NextResponse.json(
        { error: `บัญชีของคุณทำรายการเร็วเกินไป กรุณารอสักครู่` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const productId = body?.productId;
    const optionId = body?.optionId || null;
    const couponCode = body?.couponCode?.trim() || null;
    const quantity = Number(body?.quantity ?? 1);

    // Strict integer & bounds validation
    if (
      !productId ||
      typeof productId !== "string" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 50
    ) {
      return NextResponse.json(
        { error: "ข้อมูลจำนวนการสั่งซื้อไม่ถูกต้อง (ต้องเป็นจำนวนเต็ม 1 - 50 ชิ้น)" },
        { status: 400 }
      );
    }

    // Pre-check product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "ไม่พบสินค้านี้ หรือสินค้านี้ถูกปิดการจำหน่าย" },
        { status: 404 }
      );
    }

    if (product.isSuspended) {
      return NextResponse.json(
        { error: "สินค้านี้ปิดการขายชั่วคราว ไม่สามารถทำการสั่งซื้อได้" },
        { status: 400 }
      );
    }

    let unitPrice = product.price;
    let selectedOptionName: string | null = null;

    // Check variants
    if (product.hasVariants) {
      if (!optionId) {
        return NextResponse.json(
          { error: "สินค้านี้มีตัวเลือกย่อย กรุณาเลือกตัวเลือกที่ต้องการสั่งซื้อ" },
          { status: 400 }
        );
      }
      const matchedOption = product.options.find((o) => o.id === optionId);
      if (!matchedOption) {
        return NextResponse.json(
          { error: "ไม่พบตัวเลือกสินค้าที่ระบุ" },
          { status: 400 }
        );
      }
      unitPrice = matchedOption.price;
      selectedOptionName = matchedOption.name;
    }

    // Fetch available stock items
    const stockWhere: Record<string, unknown> = {
      productId: product.id,
      isUsed: false,
    };
    if (product.hasVariants && optionId) {
      stockWhere.optionId = optionId;
    }

    const availableStock = await prisma.stockItem.findMany({
      where: stockWhere,
      take: quantity,
      orderBy: { createdAt: "asc" },
    });

    if (availableStock.length < quantity) {
      const optionLabel = selectedOptionName ? ` "${selectedOptionName}"` : "";
      return NextResponse.json(
        {
          error: `สินค้า${optionLabel} มีสต็อกไม่เพียงพอ (คงเหลือ ${availableStock.length} ชิ้น)`,
        },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = Number((unitPrice * quantity).toFixed(2));

    // Handle coupon
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const cleanCode = couponCode.toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { error: "รหัสคูปองไม่ถูกต้อง หรือคูปองถูกปิดใช้งาน" },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "คูปองส่วนลดนี้หมดอายุแล้ว" },
          { status: 400 }
        );
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: "คูปองส่วนลดนี้ถูกใช้ครบสิทธิ์แล้ว" },
          { status: 400 }
        );
      }

      if (coupon.productId && coupon.productId !== product.id) {
        return NextResponse.json(
          { error: "คูปองนี้ไม่สามารถใช้กับสินค้านี้ได้" },
          { status: 400 }
        );
      }

      if (coupon.minSpend > 0 && subtotal < coupon.minSpend) {
        return NextResponse.json(
          {
            error: `ยอดสั่งซื้อขั้นต่ำสำหรับคูปองนี้คือ ฿${coupon.minSpend.toFixed(2)}`,
          },
          { status: 400 }
        );
      }

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
      appliedCoupon = coupon;
    }

    const totalCost = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    // Check balance
    if (user.balance < totalCost) {
      return NextResponse.json(
        {
          error: `ยอดเงินในกระเป๋าไม่เพียงพอ (ต้องการ ฿${totalCost.toFixed(
            2
          )} มียอดคงเหลือ ฿${user.balance.toFixed(2)}) กรุณาเติมเงิน`,
          needTopup: true,
          requiredAmount: Number((totalCost - user.balance).toFixed(2)),
        },
        { status: 400 }
      );
    }

    const deliveredStock = availableStock.slice(0, quantity);
    const deliveredText = deliveredStock.map((s) => s.content).join("\n");
    const stockIds = deliveredStock.map((s) => s.id);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 900 + 100
    )}`;

    // 1. Atomic balance deduction
    if (totalCost > 0) {
      const deductRes = await prisma.user.updateMany({
        where: {
          id: user.id,
          balance: { gte: totalCost },
        },
        data: {
          balance: { decrement: totalCost },
        },
      });

      if (deductRes.count === 0) {
        return NextResponse.json(
          { error: "ยอดเงินคงเหลือไม่เพียงพอสำหรับการทำรายการนี้" },
          { status: 400 }
        );
      }
    }

    // 2. Create order record
    let newOrder;
    try {
      newOrder = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          productId: product.id,
          productName: product.name,
          optionName: selectedOptionName,
          price: unitPrice,
          quantity,
          discountAmount,
          couponCode: appliedCoupon?.code || null,
          totalAmount: totalCost,
          deliveredData: deliveredText,
          status: "COMPLETED",
        },
      });
    } catch {
      // Fallback without newly added variant/coupon columns if D1 schema differs
      try {
        newOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId: user.id,
            productId: product.id,
            productName: product.name,
            price: unitPrice,
            quantity,
            totalAmount: totalCost,
            deliveredData: deliveredText,
            status: "COMPLETED",
          },
        });
      } catch (orderErr) {
        // Refund balance if order creation completely failed
        if (totalCost > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: totalCost } },
          }).catch(() => {});
        }
        throw orderErr;
      }
    }

    // 3. Atomic stock claim
    const stockClaimRes = await prisma.stockItem.updateMany({
      where: {
        id: { in: stockIds },
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
        orderId: newOrder.id,
      },
    });

    if (stockClaimRes.count !== quantity) {
      // Refund balance and mark order failed if stock collision
      if (totalCost > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: totalCost } },
        }).catch(() => {});
      }
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { status: "FAILED" },
      }).catch(() => {});

      return NextResponse.json(
        { error: "สินค้าชิ้นนี้เพิ่งถูกสั่งซื้อตัดหน้าไปเมื่อสักครู่ กรุณากดสั่งซื้อใหม่อีกครั้ง" },
        { status: 409 }
      );
    }

    // 4. Increment coupon usage
    if (appliedCoupon) {
      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});
    }

    // 5. Fetch updated balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    // Discord webhook notification
    try {
      const itemTitle = selectedOptionName
        ? `${product.name} [${selectedOptionName}] (x${quantity})`
        : `${product.name} (x${quantity})`;

      await sendDiscordNotification({
        title: "🛒 มีรายการสั่งซื้อสินค้าใหม่!",
        description: `ออเดอร์ **${newOrder.orderNumber}** สั่งซื้อสำเร็จ`,
        color: 0x10b981,
        fields: [
          { name: "ลูกค้า", value: user.username, inline: true },
          { name: "สินค้า", value: itemTitle, inline: true },
          { name: "ยอดชำระ", value: `฿${totalCost.toFixed(2)}${discountAmount > 0 ? ` (ลด ฿${discountAmount.toFixed(2)})` : ""}`, inline: true },
        ],
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "สั่งซื้อสำเร็จ! ได้รับข้อมูลสินค้าเรียบร้อยแล้ว",
      orderNumber: newOrder.orderNumber,
      productName: product.name,
      optionName: selectedOptionName,
      deliveredData: deliveredText,
      totalAmount: totalCost,
      discountAmount,
      newBalance: updatedUser?.balance ?? 0,
      createdAt: newOrder.createdAt,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Buy API Error]:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบขณะประมวลผลคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
