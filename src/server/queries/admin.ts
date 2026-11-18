import "server-only";

import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/admin";
import {
  ADMIN_PAGE_SIZE,
  ORDER_STATUS,
  type OrderStatus,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/utils";

async function assertAdmin(): Promise<void> {
  const admin = await requireAdmin();

  if (!admin.ok) {
    throw new Error("无权限访问");
  }
}

const adminProductListSelect = {
  id: true,
  name: true,
  slug: true,
  priceCents: true,
  stock: true,
  status: true,
  imageUrl: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

export async function getAdminProducts({
  page = 1,
  search = "",
}: {
  page?: number;
  search?: string;
} = {}) {
  await assertAdmin();

  const safePage = parsePage(page);
  const rawKeyword = search.trim();
  const keyword = rawKeyword.replace(/[%_\\]/g, "").slice(0, 50);
  const where: Prisma.ProductWhereInput = rawKeyword
    ? keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { slug: { contains: keyword } },
          ],
        }
      : { id: { in: [] } }
    : {};

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);

  const items = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    select: adminProductListSelect,
  });

  return {
    items,
    total,
    page: currentPage,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages,
  };
}

export async function getAdminProductById(id: string) {
  await assertAdmin();

  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceCents: true,
      stock: true,
      imageUrl: true,
      status: true,
      sortOrder: true,
      categoryId: true,
      updatedAt: true,
    },
  });
}

export async function getAdminCategories() {
  await assertAdmin();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    productCount: _count.products,
  }));
}

const adminOrderListSelect = {
  id: true,
  orderNo: true,
  status: true,
  totalCents: true,
  createdAt: true,
  user: {
    select: {
      email: true,
      name: true,
    },
  },
  items: {
    select: { quantity: true },
  },
} satisfies Prisma.OrderSelect;

export async function getAdminOrders({
  page = 1,
  status,
}: {
  page?: number;
  status?: string;
} = {}) {
  await assertAdmin();

  const safePage = parsePage(page);
  const validStatus =
    status &&
    (Object.values(ORDER_STATUS) as string[]).includes(status)
      ? (status as OrderStatus)
      : undefined;
  const where: Prisma.OrderWhereInput = validStatus
    ? { status: validStatus }
    : {};

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    select: adminOrderListSelect,
  });

  const items = rows.map(({ items: orderItems, ...order }) => ({
    ...order,
    itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
  }));

  return {
    items,
    total,
    page: currentPage,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages,
    status: validStatus,
  };
}

export async function getAdminStats() {
  await assertAdmin();

  const [productCount, orderCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
  ]);

  return { productCount, orderCount, categoryCount };
}

export type AdminProductListItem = Awaited<
  ReturnType<typeof getAdminProducts>
>["items"][number];
export type AdminOrderListItem = Awaited<
  ReturnType<typeof getAdminOrders>
>["items"][number];
export type AdminCategoryItem = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];
