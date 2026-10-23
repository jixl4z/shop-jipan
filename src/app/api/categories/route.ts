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

    for (const c of categories) {
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
