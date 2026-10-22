import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const recommendedOnly = searchParams.get("recommended") === "true";

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (recommendedOnly) {
      where.isRecommended = true;
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stockItems: {
          select: { id: true },
          where: { isUsed: false },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      badge: p.badge,
      isRecommended: p.isRecommended,
      category: p.category,
      stockCount: p.stockItems.length,
    }));

    return NextResponse.json({ products: formatted });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
