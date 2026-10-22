import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        products: {
          select: {
            id: true,
            image: true,
          },
          where: { isActive: true },
        },
      },
    });

    const formatted = categories.map((c) => {
      const isIconUrl =
        c.icon &&
        (c.icon.startsWith("http://") ||
          c.icon.startsWith("https://") ||
          c.icon.startsWith("/") ||
          c.icon.startsWith("data:"));

      const isSlugUrl =
        c.slug &&
        (c.slug.startsWith("http://") ||
          c.slug.startsWith("https://") ||
          c.slug.startsWith("/") ||
          c.slug.startsWith("data:"));

      const bannerImage = isIconUrl
        ? c.icon
        : isSlugUrl
        ? c.slug
        : c.products?.[0]?.image || null;

      return {
        id: c.id,
        name: c.name,
        slug: isSlugUrl
          ? c.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || c.id
          : c.slug,
        icon: isIconUrl ? "Package" : c.icon,
        description: c.description,
        productCount: c.products?.length || 0,
        bannerImage,
      };
    });

    return NextResponse.json({ categories: formatted });
  } catch (err: unknown) {
    console.error("[Categories GET Error]:", err);
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
