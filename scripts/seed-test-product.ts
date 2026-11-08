import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst();
  if (!category) {
    console.log("No category found");
    return;
  }

  // 1. Create or update "สินค้าทดสอบ 3"
  const existingProduct = await prisma.product.findUnique({
    where: { slug: "test-product-3" },
  });

  let product = existingProduct;
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: "สินค้าทดสอบ 3",
        slug: "test-product-3",
        description: "สินค้าทดสอบ",
        price: 10,
        originalPrice: 20,
        image: "",
        hasVariants: true,
        categoryId: category.id,
        isRecommended: true,
      },
    });
    console.log("Created product:", product.name);
  } else {
    product = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: "สินค้าทดสอบ 3",
        description: "สินค้าทดสอบ",
        hasVariants: true,
      },
    });
    console.log("Updated product:", product.name);
  }

  // 2. Clear old options and create 5 options
  await prisma.productOption.deleteMany({
    where: { productId: product.id },
  });

  const opt1 = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "1 วัน",
      price: 10,
      badge: "🌸",
      order: 1,
    },
  });

  const opt2 = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "7 วัน",
      price: 20,
      badge: "🌸",
      order: 2,
    },
  });

  const opt3 = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "15 วัน",
      price: 50,
      badge: null,
      order: 3,
    },
  });

  const opt4 = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "30 วัน",
      price: 100,
      badge: "🌸",
      order: 4,
    },
  });

  const opt5 = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "ถาวร",
      price: 299,
      badge: "🌸",
      order: 5,
    },
  });

  console.log("Created 5 options");

  // 3. Add 10 stock items to opt1
  const stockLines = Array.from({ length: 10 }, (_, i) => `TEST-KEY-DAY1-${i + 1}-${Math.random().toString(36).slice(-6)}`);
  await prisma.stockItem.createMany({
    data: stockLines.map((content) => ({
      productId: product.id,
      optionId: opt1.id,
      content,
      isUsed: false,
    })),
  });
  console.log("Added 10 stock keys to option 1 วัน");

  // 4. Create sample coupon
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: "PROMO10" },
  });

  if (!existingCoupon) {
    await prisma.coupon.create({
      data: {
        code: "PROMO10",
        title: "ลดพิเศษ 10%",
        description: "ลด 10% ไม่มีขั้นต่ำในการสั่งซื้อ ใช้ได้ไม่จำกัดเวลา",
        discountType: "PERCENT",
        discountValue: 10,
        minSpend: 0,
        maxDiscount: 100,
        isActive: true,
      },
    });
    console.log("Created coupon: PROMO10");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
