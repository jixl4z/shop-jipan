import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      author: r.user.username,
      avatar: r.user.avatar,
      rating: r.rating,
      comment: r.comment,
      product: r.productName || "บริการทั่วไป",
      date: new Date(r.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (err: unknown) {
    console.error("[Reviews GET Error]:", err);
    return NextResponse.json({ success: true, reviews: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rating, comment, productName } = body;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5 ดาว" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
      return NextResponse.json(
        { error: "กรุณาระบุความคิดเห็นอย่างน้อย 3 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: "ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        rating: Math.round(parsedRating),
        comment: comment.trim(),
        productName: productName?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (err: unknown) {
    console.error("[Reviews POST Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกรีวิว" },
      { status: 500 }
    );
  }
}
