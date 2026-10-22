import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

// Helper to auto-create Review table on Cloudflare D1 if it doesn't exist yet
async function ensureReviewTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "productName" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (e) {
    console.warn("[Ensure Review Table]", e);
  }
}

export async function GET() {
  try {
    await ensureReviewTable();

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
      author: r.user?.username || "ลูกค้าทั่วไป",
      avatar: r.user?.avatar || null,
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
    await ensureReviewTable();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว" },
        { status: 401 }
      );
    }

    // 1-hour cooldown per user to prevent review spam
    const rateCheck = checkRateLimit(`review_limit_${user.id}`, 1, 60 * 60 * 1000);
    if (!rateCheck.success) {
      const remainingMin = Math.ceil(rateCheck.resetInSec / 60);
      return NextResponse.json(
        { error: `คุณสามารถส่งรีวิวได้ 1 ครั้งต่อ 1 ชั่วโมง (กรุณารออีก ${remainingMin} นาที)` },
        { status: 429 }
      );
    }

    // Database check for 1-hour cooldown
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recent = await prisma.review.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: oneHourAgo },
        },
      });
      if (recent) {
        return NextResponse.json(
          { error: "คุณเพิ่งส่งรีวิวไปเมื่อไม่นานมานี้ ระบบจำกัดให้ส่งรีวิวได้ 1 ครั้งต่อ 1 ชั่วโมง" },
          { status: 429 }
        );
      }
    } catch {
      // If table query fails, proceed
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

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    // Quality check: Reject trivial/spam reviews (must be at least 10 chars)
    if (trimmedComment.length < 10) {
      return NextResponse.json(
        { error: "กรุณาระบุความคิดเห็นอย่างน้อย 10 ตัวอักษร เพื่อให้เป็นรีวิวที่มีคุณภาพและเป็นประโยชน์ต่อผู้อื่น (ไม่รับรีวิวส่งๆ)" },
        { status: 400 }
      );
    }

    if (trimmedComment.length > 500) {
      return NextResponse.json(
        { error: "ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร" },
        { status: 400 }
      );
    }

    // Reject repetitive spam (e.g. "aaaaaaaaaa", "5555555555", "..........")
    const cleanChars = trimmedComment.replace(/\s+/g, "");
    const uniqueChars = new Set(cleanChars).size;
    if (uniqueChars < 3) {
      return NextResponse.json(
        { error: "กรุณาเขียนข้อความรีวิวที่มีความหมาย หลีกเลี่ยงการพิมพ์ตัวอักษรซ้ำๆ หรือรีวิวส่งๆ" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        rating: Math.round(parsedRating),
        comment: trimmedComment,
        productName: productName?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (err: unknown) {
    console.error("[Reviews POST Error]:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกรีวิว กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
