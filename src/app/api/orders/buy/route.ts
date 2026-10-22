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

    // Per-user rate limit to prevent multi-IP race condition spam on a single account
    const userRateCheck = checkRateLimit(`buy_user_${user.id}`, 8, 60 * 1000);
    if (!userRateCheck.success) {
      return NextResponse.json(
        { error: `บัญชีของคุณทำรายการเร็วเกินไป กรุณารอสักครู่` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const productId = body?.productId;
    const quantity = Number(body?.quantity ?? 1);

    // Strict integer & bounds validation to prevent NaN / float / negative exploits
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

    // Pre-check product and balance before entering transaction
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockItems: {
          where: { isUsed: false },
          take: quantity,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product || !product.isActive || product.price < 0) {
      return NextResponse.json(
        { error: "ไม่พบสินค้านี้ หรือสินค้านี้ถูกปิดการจำหน่าย" },
        { status: 404 }
      );
    }

    if (product.stockItems.length < quantity) {
      return NextResponse.json(
        {
          error: `สินค้ามีสต็อกไม่เพียงพอ (คงเหลือ ${product.stockItems.length} ชิ้น)`,
        },
        { status: 400 }
      );
    }

    const totalCost = Number((product.price * quantity).toFixed(2));

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

    const deliveredStock = product.stockItems.slice(0, quantity);
    const deliveredText = deliveredStock.map((s) => s.content).join("\n");
    const stockIds = deliveredStock.map((s) => s.id);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 900 + 100
    )}`;

    // Execute atomic interactive transaction (Anti-Double-Spend & Anti-Stock-Collision)
    const txResult = await prisma.$transaction(async (tx) => {
      // 1. Atomic conditional balance deduction (fails if concurrent request spent the balance)
      const deductRes = await tx.user.updateMany({
        where: {
          id: user.id,
          balance: { gte: totalCost },
        },
        data: {
          balance: { decrement: totalCost },
        },
      });

      if (deductRes.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // 2. Create order record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          totalAmount: totalCost,
          deliveredData: deliveredText,
          status: "COMPLETED",
        },
      });

      // 3. Atomic conditional stock locking (fails if concurrent buyer took any of these stockIds)
      const stockClaimRes = await tx.stockItem.updateMany({
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
        throw new Error("STOCK_RACE_CONDITION");
      }

      // 4. Fetch updated balance
      const updatedUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      return {
        newOrder,
        newBalance: updatedUser?.balance ?? 0,
      };
    });

    // Optional non-blocking Discord webhook notification
    sendDiscordNotification({
      title: "🛒 มีรายการสั่งซื้อสินค้าใหม่!",
      description: `ออเดอร์ **${txResult.newOrder.orderNumber}** สั่งซื้อสำเร็จ`,
      color: 0x10b981,
      fields: [
        { name: "ลูกค้า", value: user.username, inline: true },
        { name: "สินค้า", value: `${product.name} (x${quantity})`, inline: true },
        { name: "ยอดชำระ", value: `฿${totalCost.toFixed(2)}`, inline: true },
      ],
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "สั่งซื้อสำเร็จ! ได้รับข้อมูลสินค้าเรียบร้อยแล้ว",
      orderNumber: txResult.newOrder.orderNumber,
      productName: product.name,
      deliveredData: deliveredText,
      newBalance: txResult.newBalance,
      createdAt: txResult.newOrder.createdAt,
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "ยอดเงินคงเหลือไม่เพียงพอสำหรับการทำรายการนี้" },
        { status: 400 }
      );
    }
    if (error.message === "STOCK_RACE_CONDITION") {
      return NextResponse.json(
        { error: "สินค้าชิ้นนี้เพิ่งถูกสั่งซื้อตัดหน้าไปเมื่อสักครู่ กรุณากดสั่งซื้อใหม่อีกครั้ง" },
        { status: 409 }
      );
    }
    console.error("[Buy API Error]:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบขณะประมวลผลคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
