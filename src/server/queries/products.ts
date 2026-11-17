import { Prisma } from "@prisma/client";

import { PRODUCTS_PAGE_SIZE, PRODUCT_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/utils";

export type ProductListParams = {
  search?: string;
  category?: string;
  page?: number;
};

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  priceCents: true,
  stock: true,
  imageUrl: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

function buildNameFilter(keyword: string): Prisma.ProductWhereInput {
  if (!keyword) {
    return {};
  }

  const safeKeyword = keyword.replace(/[%_\\]/g, "").slice(0, 50);

  return safeKeyword
    ? { name: { contains: safeKeyword } }
    : { id: { in: [] } };
}

export async function getProducts({
  search,
  category,
  page = 1,
}: ProductListParams) {
  const safePage = parsePage(page);
  const where: Prisma.ProductWhereInput = {
    status: PRODUCT_STATUS.ACTIVE,
    ...buildNameFilter(search?.trim() ?? ""),
    ...(category ? { category: { slug: category } } : {}),
  };

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);

  const items = await prisma.product.findMany({
    where,
    select: productCardSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    skip: (currentPage - 1) * PRODUCTS_PAGE_SIZE,
    take: PRODUCTS_PAGE_SIZE,
  });

  return {
    items,
    total,
    page: currentPage,
    pageSize: PRODUCTS_PAGE_SIZE,
    totalPages,
  };
}

export async function getProductById(id: string) {
  return prisma.product.findFirst({
    where: {
      id,
      status: PRODUCT_STATUS.ACTIVE,
    },
    select: {
      ...productCardSelect,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type ProductListItem = Awaited<
  ReturnType<typeof getProducts>
>["items"][number];

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductById>>
>;
