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
      const allCategories = await prisma.category.findMany();

      // Auto-heal any corrupted category slugs in D1 (if slug was mistakenly saved as image URL)
      for (const c of allCategories) {
        if (
          c.slug &&
          (c.slug.startsWith("http://") || c.slug.startsWith("https://") || c.slug.startsWith("/"))
        ) {
          const cleanSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || c.id;
          try {
            await prisma.category.update({
              where: { id: c.id },
              data: {
                slug: cleanSlug,
                icon: c.slug,
              },
            });
            c.icon = c.slug;
            c.slug = cleanSlug;
          } catch (healErr) {
            console.warn("Category auto-heal warning:", healErr);
          }
        }
      }

      const matchedCategory = allCategories.find((c) => {
        const isSlugUrl =
          c.slug &&
          (c.slug.startsWith("http://") ||
            c.slug.startsWith("https://") ||
            c.slug.startsWith("/") ||
            c.slug.startsWith("data:"));
        const cleanSlug = isSlugUrl
          ? c.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || c.id
          : c.slug;

        return (
          cleanSlug.toLowerCase() === categorySlug.toLowerCase() ||
          c.slug.toLowerCase() === categorySlug.toLowerCase() ||
          c.name.toLowerCase() === categorySlug.toLowerCase() ||
          c.id === categorySlug
        );
      });

      if (matchedCategory) {
        where.categoryId = matchedCategory.id;
      } else {
        where.category = {
          slug: categorySlug,
        };
      }
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

    const formatted = products.map((p) => {
      const isSlugUrl =
        p.category?.slug &&
        (p.category.slug.startsWith("http://") ||
          p.category.slug.startsWith("https://") ||
          p.category.slug.startsWith("/") ||
          p.category.slug.startsWith("data:"));

      const cleanCat = p.category
        ? {
            ...p.category,
            slug: isSlugUrl
              ? p.category.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || p.category.id
              : p.category.slug,
          }
        : null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        badge: p.badge,
        isRecommended: p.isRecommended,
        category: cleanCat,
        stockCount: p.stockItems.length,
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
