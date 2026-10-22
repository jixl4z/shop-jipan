const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Default Users (Admin & Customer)
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const userPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@jipanshop.com",
      password: adminPassword,
      role: "ADMIN",
      balance: 9999.0,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { username: "demo_user" },
    update: {},
    create: {
      username: "demo_user",
      email: "customer@demo.com",
      password: userPassword,
      role: "USER",
      balance: 500.0,
    },
  });

  console.log("👤 Created users:", admin.username, demoUser.username);

  // 2. Create Categories
  const categoriesData = [
    {
      name: "เติมเกม / พ้อยท์",
      slug: "game-topup",
      icon: "Gamepad2",
      description: "บัตรเติมพ้อยท์ แพ็กเกจเกม และ Pass ประจำซีซั่น",
      order: 1,
    },
    {
      name: "แอปพรีเมียม",
      slug: "premium-apps",
      icon: "Tv",
      description: "แอปดูหนัง ฟังเพลง สตรีมมิ่ง คุณภาพคมชัด ไม่สะดุด",
      order: 2,
    },
    {
      name: "ไอดีและรหัสเกม",
      slug: "game-accounts",
      icon: "Key",
      description: "ไอดีเริ่มต้น ไอดีไก่ตัน ไอดีแรงค์สูง พร้อมเปลี่ยนข้อมูล",
      order: 3,
    },
    {
      name: "กล่องสุ่มดิจิทัล",
      slug: "mystery-box",
      icon: "Gift",
      description: "กล่องสุ่มสุดคุ้ม ลุ้นรับคีย์เกมแรร์ และไอเทมพรีเมียม",
      order: 4,
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = c.id;
  }
  console.log("📁 Categories created");

  // 3. Create Sample Products & Stock Items
  const productsData = [
    {
      name: "บัตรเติมเงิน 500 Points (Official Code)",
      slug: "points-500-code",
      categoryId: categories["game-topup"],
      price: 450.0,
      originalPrice: 500.0,
      image: "/images/points-500.webp",
      badge: "HOT",
      isRecommended: true,
      description: "รหัสบัตรเติมเงิน 500 Points เติมได้ทุกเซิร์ฟเวอร์ รับโค้ดทันทีหลังกดซื้อ นำไปรีดีมได้ทันทีตลอด 24 ชม.",
      stock: [
        "POINT500-ABCD-8891-XK92",
        "POINT500-EFGH-1234-LM44",
        "POINT500-IJKL-9876-QW88",
        "POINT500-MNOP-5544-ZZ10",
        "POINT500-QRST-7711-BB99",
      ],
    },
    {
      name: "บัตรเติมเงิน 1,000 Points (รหัสแท้)",
      slug: "points-1000-code",
      categoryId: categories["game-topup"],
      price: 890.0,
      originalPrice: 1000.0,
      image: "/images/points-1000.webp",
      badge: "BEST SELLER",
      isRecommended: true,
      description: "รหัสบัตรเติมเงิน 1,000 Points ประหยัดสุดคุ้ม ใช้เติมเกมได้ทันทีตลอด 24 ชั่วโมง",
      stock: [
        "POINT1000-XK91-8891-MN44",
        "POINT1000-AA22-7711-BB88",
        "POINT1000-ZZ99-1234-LK77",
      ],
    },
    {
      name: "Season Pass พาสเกมยอดฮิต ซีซั่นใหม่",
      slug: "season-pass-latest",
      categoryId: categories["game-topup"],
      price: 259.0,
      originalPrice: 320.0,
      image: "/images/season-pass.webp",
      badge: "POPULAR",
      isRecommended: true,
      description: "ปลดล็อก Season Pass เลเวลเต็ม ได้รับสกินและของรางวัลทั้งหมด ส่งมอบเป็น Redemption Key สำหรับเปิดใช้งาน",
      stock: [
        "PASS-SEA-2026-XN881923",
        "PASS-SEA-2026-MN448190",
        "PASS-SEA-2026-LK772154",
      ],
    },
    {
      name: "Premium ดูหนัง 30 วัน (จอส่วนตัว คมชัด 4K)",
      slug: "cinema-premium-30days",
      categoryId: categories["premium-apps"],
      price: 89.0,
      originalPrice: 169.0,
      image: "/images/movie-30.webp",
      badge: "BEST SELLER",
      isRecommended: true,
      description: "แอปดูหนังความละเอียด 4K HDR จอส่วนตัว มีรหัส PIN ล็อกโปรไฟล์ ใช้งานได้ 30 วันเต็ม รับประกันตลอดอายุการใช้งาน",
      stock: [
        "USER: cinema_user1@vip.com | PASS: Pass#2026_A | PIN: 1234",
        "USER: cinema_user2@vip.com | PASS: Pass#2026_B | PIN: 5678",
        "USER: cinema_user3@vip.com | PASS: Pass#2026_C | PIN: 9012",
        "USER: cinema_user4@vip.com | PASS: Pass#2026_D | PIN: 3456",
      ],
    },
    {
      name: "Premium ฟังเพลง คุณภาพเสียง Lossless 3 เดือน",
      slug: "music-premium-3months",
      categoryId: categories["premium-apps"],
      price: 149.0,
      originalPrice: 299.0,
      image: "/images/music-3m.webp",
      badge: "SAVE 50%",
      isRecommended: true,
      description: "ฟังเพลงแบบไม่มีโฆษณา ดาวน์โหลดเพลงออฟไลน์ เสียงคมชัดระดับ Hi-Fi Lossless ส่งมอบเป็นลิงก์คำเชิญครอบครัวด่วน",
      stock: [
        "LINK: https://invite.music-service.com/join/family?token=tok_8819a82f",
        "LINK: https://invite.music-service.com/join/family?token=tok_4410b91c",
        "LINK: https://invite.music-service.com/join/family?token=tok_9931c44d",
      ],
    },
    {
      name: "ไอดีเกมเริ่มต้น มีตัวละคร 5 ดาว 2 ตัว + เพชร 5,000",
      slug: "game-starter-account-5star",
      categoryId: categories["game-accounts"],
      price: 99.0,
      originalPrice: 199.0,
      image: "/images/skin-code.webp",
      badge: "LIMITED",
      isRecommended: false,
      description: "ไอดีเริ่มต้นสำหรับผู้เล่นใหม่ สุ่มได้ตัวท็อปเมต้า 5 ดาว 2 ตัวทันที มีเพชรสะสมพร้อมเปิดกาชา ไม่ผูกเบอร์ เปลี่ยนอีเมลได้",
      stock: [
        "ID: starter_hero_01 | PASS: HeroPass!2026",
        "ID: starter_hero_02 | PASS: HeroPass!9981",
      ],
    },
    {
      name: "ไอดีเกม VIP โค้ดสกิน Limited แท้",
      slug: "game-skin-limited",
      categoryId: categories["game-accounts"],
      price: 199.0,
      originalPrice: 350.0,
      image: "/images/skin-code(1).webp",
      badge: "HOT",
      isRecommended: true,
      description: "โค้ดสกินหายากระดับ Limited สำหรับผู้เล่นสายสะสม แลกรับได้ในเกมทันที",
      stock: [
        "CODE: SKIN-LTD-9912-AAB1",
        "CODE: SKIN-LTD-4412-FF99",
      ],
    },
    {
      name: "กล่องสุ่ม Diamond ดิจิทัล (ลุ้นคีย์เกม AAA / บัตร 1,000฿)",
      slug: "mystery-box-diamond",
      categoryId: categories["mystery-box"],
      price: 49.0,
      originalPrice: 99.0,
      image: "/images/box-diamond.webp",
      badge: "LUCKY",
      isRecommended: true,
      description: "กล่องสุ่มราคาเบาๆ ลุ้นรับของรางวัลใหญ่ คีย์เกม Steam แท้ หรือบัตรเติมเงิน 1,000 บาท ได้รับโค้ดสุ่มเปิดลุ้นทันที",
      stock: [
        "🎁 DIAMOND BOX: [YOU WON: Steam Key 'Cyberpunk Adventure' - CODE: CDPR-8819-ZZA]",
        "🎁 DIAMOND BOX: [YOU WON: บัตรเติมเงิน 100 Points - CODE: PT100-8819-BBA]",
        "🎁 DIAMOND BOX: [YOU WON: โค้ดส่วนลด 50% ครั้งถัดไป - CODE: DISCOUNT50-YY]",
        "🎁 DIAMOND BOX: [YOU WON: Steam Key 'RPG Legend' - CODE: RPG-4412-MKA]",
        "🎁 DIAMOND BOX: [YOU WON: บัตรทรูมันนี่ 50฿ - CODE: TM50-88912-11]",
      ],
    },
    {
      name: "กล่องสุ่ม Gold คลังทองคำ (การันตีของมูลค่า 100฿+)",
      slug: "mystery-box-gold",
      categoryId: categories["mystery-box"],
      price: 99.0,
      originalPrice: 159.0,
      image: "/images/box-gold.webp",
      badge: "POPULAR",
      isRecommended: true,
      description: "กล่องสุ่มระดับโกลด์ การันตีของรางวัลคุ้มเกินราคา ทุกกล่องได้รับของแน่นอน",
      stock: [
        "🎁 GOLD BOX: [YOU WON: คีย์แท้ 'GTA Premium Edition' - KEY: GTA5-VIP-8819]",
        "🎁 GOLD BOX: [YOU WON: บัตรเติมเกม 150 Points - CODE: PT150-1122-88]",
      ],
    },
  ];

  for (const p of productsData) {
    const { stock, ...productData } = p;
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: productData,
    });

    // Delete existing unused stock to avoid duplicate seeds
    await prisma.stockItem.deleteMany({
      where: { productId: prod.id, isUsed: false },
    });

    for (const key of stock) {
      await prisma.stockItem.create({
        data: {
          productId: prod.id,
          content: key,
          isUsed: false,
        },
      });
    }
  }
  console.log("🎮 Products and stock items created");

  // 4. Shop Settings
  await prisma.shopSetting.upsert({
    where: { id: "default" },
    update: {
      slipApiKey: "SLIPOKC43QGIC",
      slipApiBranch: "78463",
      slipProvider: "slipok",
      truemoneyNumber: "0812345678",
    },
    create: {
      id: "default",
      shopName: "JIPAN STORE",
      shopSlogan: "ศูนย์รวมสินค้าดิจิทัล ไอดีเกม และแอปพรีเมียมระบบอัตโนมัติ 24 ชม.",
      shopNotice: "⚡ ประกาศ: เติมเงินผ่านสลิปพร้อมเพย์ & ทรูวอเล็ท (ซองอั่งเปา) ระบบตรวจสอบยอดเงินอัตโนมัติ ซื้อแล้วรับของทันที 24 ชม.",
      themeColor: "monochrome",
      themeMode: "dark",
      promptPayNumber: "0812345678",
      promptPayName: "นาย จิรกิจ ปานศรี (ร้านค้าทดสอบ)",
      truemoneyNumber: "0812345678",
      slipApiKey: "SLIPOKC43QGIC",
      slipApiBranch: "78463",
      slipProvider: "slipok",
      contactDiscord: "https://discord.gg/jipan",
      contactFacebook: "https://facebook.com/jipanstore",
      contactLine: "https://line.me/ti/p/@jipan",
    },
  });
  console.log("⚙️ Shop settings initialized with SlipOK and TrueMoney");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
