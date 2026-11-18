import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const orderListSelect = {
  id: true,
  orderNo: true,
  status: true,
  totalCents: true,
  createdAt: true,
  _count: {
    select: { items: true },
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

export async function getOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: orderListSelect,
  });

  return orders.map(({ _count, ...order }) => ({
    ...order,
    itemCount: _count.items,
  }));
}

export async function getOrderById(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: orderDetailSelect,
  });
}

export type OrderListItem = Awaited<ReturnType<typeof getOrders>>[number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderById>>
>;
