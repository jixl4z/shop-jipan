import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const productSlug = searchParams.get("slug");
    const search = searchParams.get("search");
    const recommendedOnly = searchParams.get("recommended") === "true";

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (productSlug && productSlug.trim() !== "") {
      let decodedSlug = productSlug;
      try {
        decodedSlug = decodeURIComponent(productSlug);
      } catch {}

      where.OR = [
        { slug: productSlug },
        { slug: decodedSlug },
        { id: productSlug },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      const allCategories = await prisma.category.findMany();

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

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where,
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
            select: { id: true, optionId: true },
            where: { isUsed: false },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr: any) {
      console.warn("Product findMany error, auto-healing schema:", dbErr?.message);
      await ensureDatabaseSchema().catch(() => {});
      try {
        products = await prisma.product.findMany({
          where,
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
              select: { id: true, optionId: true },
              where: { isUsed: false },
            },
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } catch (retryErr) {
        // Fallback to raw query without crashing
        const rawProducts: any = await prisma.$queryRawUnsafe(`SELECT * FROM "Product" WHERE "isActive" = 1 OR "isActive" IS NULL`);
        if (Array.isArray(rawProducts)) {
          return NextResponse.json({
            products: rawProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description,
              price: Number(p.price || 0),
              originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
              image: p.image,
              badge: p.badge || null,
              isRecommended: Boolean(p.isRecommended),
              isSuspended: Boolean(p.isSuspended),
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
              hasVariants: Boolean(p.hasVariants),
              options: [],
              category: null,
              stockCount: 0,
              soldCount: 0,
            })),
          });
        }
        return NextResponse.json({ products: [] });
      }
    }

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

      const optionsFormatted = p.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        price: opt.price,
        originalPrice: opt.originalPrice,
        badge: opt.badge,
        order: opt.order,
        stockCount: opt.stockItems.length,
      }));

      const totalStock = p.hasVariants && p.options.length > 0
        ? optionsFormatted.reduce((acc, curr) => acc + curr.stockCount, 0)
        : p.stockItems.length;

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
        isSuspended: p.isSuspended,
        isActive: p.isActive,
        hasVariants: p.hasVariants,
        options: optionsFormatted,
        category: cleanCat,
        stockCount: totalStock,
        soldCount: p._count?.orders ?? 0,
      };
    });

    return NextResponse.json(
      { products: formatted },
      {
        headers: {
          "Cache-Control": "public, max-age=15, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
