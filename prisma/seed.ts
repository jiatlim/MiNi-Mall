import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  sortOrder: number;
  categorySlug: string;
};

const categories: CategorySeed[] = [
  { name: "数码影音", slug: "digital", description: "耳机、音箱与智能穿戴", sortOrder: 1 },
  { name: "家居生活", slug: "home", description: "让日常更舒服的小物", sortOrder: 2 },
  { name: "服饰鞋包", slug: "fashion", description: "通勤与休闲的基础款", sortOrder: 3 },
  { name: "食品饮料", slug: "food", description: "咖啡、坚果与花果茶", sortOrder: 4 },
  { name: "美妆个护", slug: "beauty", description: "温和有效的日常护理", sortOrder: 5 },
  { name: "图书文创", slug: "books", description: "书、文具与桌面小物", sortOrder: 6 },
];

const products: ProductSeed[] = [
  {
    name: "无线降噪耳机",
    slug: "wireless-headphones",
    description: "40 小时续航，主动降噪，通勤与旅途都能安静下来。",
    priceCents: 89900,
    stock: 40,
    sortOrder: 1,
    categorySlug: "digital",
  },
  {
    name: "便携蓝牙音箱",
    slug: "bluetooth-speaker",
    description: "IPX7 防水，户外露营随手就能放。",
    priceCents: 29900,
    stock: 65,
    sortOrder: 2,
    categorySlug: "digital",
  },
  {
    name: "智能手表",
    slug: "smart-watch",
    description: "心率、血氧与睡眠监测，典型使用一周一充。",
    priceCents: 129900,
    stock: 25,
    sortOrder: 3,
    categorySlug: "digital",
  },
  {
    name: "香薰蜡烛",
    slug: "scented-candle",
    description: "雪松与柑橘调，燃烧时间约 40 小时。",
    priceCents: 8900,
    stock: 120,
    sortOrder: 1,
    categorySlug: "home",
  },
  {
    name: "纯棉四件套",
    slug: "cotton-bedding",
    description: "60 支长绒棉，亲肤透气，四季可用。",
    priceCents: 39900,
    stock: 30,
    sortOrder: 2,
    categorySlug: "home",
  },
  {
    name: "陶瓷马克杯",
    slug: "ceramic-mug",
    description: "手工釉面，每只都有细微不同的纹理。",
    priceCents: 4900,
    stock: 200,
    sortOrder: 3,
    categorySlug: "home",
  },
  {
    name: "轻量羽绒服",
    slug: "down-jacket",
    description: "90% 白鸭绒，收纳后只有一瓶水大小。",
    priceCents: 59900,
    stock: 18,
    sortOrder: 1,
    categorySlug: "fashion",
  },
  {
    name: "帆布托特包",
    slug: "canvas-tote",
    description: "加厚帆布，内袋可放 14 寸笔记本。",
    priceCents: 12900,
    stock: 80,
    sortOrder: 2,
    categorySlug: "fashion",
  },
  {
    name: "羊毛围巾",
    slug: "wool-scarf",
    description: "细腻不扎脖，秋冬通勤百搭。",
    priceCents: 19900,
    stock: 45,
    sortOrder: 3,
    categorySlug: "fashion",
  },
  {
    name: "手冲咖啡豆",
    slug: "coffee-beans",
    description: "中度烘焙，坚果与焦糖风味，200g 装。",
    priceCents: 7900,
    stock: 150,
    sortOrder: 1,
    categorySlug: "food",
  },
  {
    name: "坚果礼盒",
    slug: "nut-gift-box",
    description: "每日一袋，混合六种坚果与果干。",
    priceCents: 11800,
    stock: 90,
    sortOrder: 2,
    categorySlug: "food",
  },
  {
    name: "花果茶组合",
    slug: "flower-tea",
    description: "洛神花与苹果干，冷泡热泡都合适。",
    priceCents: 6800,
    stock: 110,
    sortOrder: 3,
    categorySlug: "food",
  },
  {
    name: "保湿精华液",
    slug: "hydrating-serum",
    description: "玻尿酸与神经酰胺复配，清爽不黏腻。",
    priceCents: 26900,
    stock: 60,
    sortOrder: 1,
    categorySlug: "beauty",
  },
  {
    name: "氨基酸洁面",
    slug: "amino-cleanser",
    description: "温和清洁，洗后不紧绷。",
    priceCents: 8900,
    stock: 140,
    sortOrder: 2,
    categorySlug: "beauty",
  },
  {
    name: "护手霜套装",
    slug: "hand-cream-set",
    description: "三支装，随身携带，滋润不油腻。",
    priceCents: 5900,
    stock: 160,
    sortOrder: 3,
    categorySlug: "beauty",
  },
  {
    name: "《小王子》精装",
    slug: "little-prince",
    description: "中英双语插图版，适合收藏与赠礼。",
    priceCents: 3900,
    stock: 75,
    sortOrder: 1,
    categorySlug: "books",
  },
  {
    name: "黄铜书签",
    slug: "brass-bookmark",
    description: "手工打磨，越用越有光泽。",
    priceCents: 2900,
    stock: 300,
    sortOrder: 2,
    categorySlug: "books",
  },
  {
    name: "手账本套装",
    slug: "journal-set",
    description: "A5 方格本、和纸胶带与贴纸的组合。",
    priceCents: 4900,
    stock: 95,
    sortOrder: 3,
    categorySlug: "books",
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed 脚本会写入演示数据，禁止在生产环境执行");
  }

  await prisma.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();

    for (const category of categories) {
      const row = await tx.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
        },
        create: category,
      });
      categoryIds.set(category.slug, row.id);
    }

    for (const product of products) {
      const { categorySlug, ...data } = product;
      const categoryId = categoryIds.get(categorySlug);
      if (!categoryId) {
        throw new Error(`未找到分类：${categorySlug}`);
      }

      const imageUrl = `/images/products/${product.slug}.svg`;

      await tx.product.upsert({
        where: { slug: product.slug },
        update: { ...data, categoryId, imageUrl },
        create: { ...data, categoryId, imageUrl },
      });
    }
  });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@mini.mall")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const resetAdminPassword =
    process.env.SEED_ADMIN_RESET_PASSWORD === "true";
  const isDevelopment =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { role: true },
  });

  if (existingAdmin && existingAdmin.role !== "ADMIN") {
    throw new Error(
      `账号 ${adminEmail} 已存在且不是管理员，拒绝自动提权。请更换 SEED_ADMIN_EMAIL 或手动处理。`,
    );
  }

  if (existingAdmin) {
    if (resetAdminPassword) {
      if (!adminPassword) {
        throw new Error(
          "SEED_ADMIN_RESET_PASSWORD=true 时必须提供 SEED_ADMIN_PASSWORD",
        );
      }

      await prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash: await hash(adminPassword, 12) },
      });
      console.log("已重置管理员密码");
    }
  } else {
    if (!adminPassword) {
      if (!isDevelopment) {
        throw new Error(
          "非开发环境创建管理员必须设置 SEED_ADMIN_PASSWORD",
        );
      }

      console.warn(
        "未设置 SEED_ADMIN_PASSWORD，使用默认演示密码 Admin123456，请尽快修改。",
      );
    }

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "管理员",
        passwordHash: await hash(adminPassword ?? "Admin123456", 12),
        role: "ADMIN",
      },
    });
  }

  console.log(`已写入 ${categories.length} 个分类、${products.length} 件商品`);
  console.log(`管理员账号：${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
