import { Prisma } from "@prisma/client";

import { ORDERS_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/utils";

export const orderListSelect = {
  id: true,
  orderNo: true,
  status: true,
  totalCents: true,
  createdAt: true,
  items: {
    select: { quantity: true },
  },
} satisfies Prisma.OrderSelect;

export const orderDetailSelect = {
  id: true,
  orderNo: true,
  status: true,
  subtotalCents: true,
  discountCents: true,
  totalCents: true,
  memberLevel: true,
  discountRateBps: true,
  paidAt: true,
  shippedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      unitPriceCents: true,
      quantity: true,
      subtotalCents: true,
    },
  },
} satisfies Prisma.OrderSelect;

export async function getOrders(userId: string, page = 1) {
  const safePage = parsePage(page);
  const where = { userId };
  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * ORDERS_PAGE_SIZE,
    take: ORDERS_PAGE_SIZE,
    select: orderListSelect,
  });

  const items = rows.map(({ items: orderItems, ...order }) => ({
    ...order,
    itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
  }));

  return {
    items,
    total,
    page: currentPage,
    pageSize: ORDERS_PAGE_SIZE,
    totalPages,
  };
}

export async function getOrderById(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: orderDetailSelect,
  });
}

export type OrderListResult = Awaited<ReturnType<typeof getOrders>>;
export type OrderListItem = OrderListResult["items"][number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderById>>
>;
