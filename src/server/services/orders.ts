import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { ORDER_STATUS, PRODUCT_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { orderDetailSelect } from "@/server/queries/orders";

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

type CheckoutItem = {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
};

function generateOrderNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

function isRetryableWriteError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" ||
      error.code === "P2034" ||
      error.code === "P2028")
  );
}

async function withOrderRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isRetryableWriteError(error)) {
      return operation();
    }

    throw error;
  }
}

export async function createOrder(userId: string) {
  return withOrderRetry(() =>
    prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              stock: true,
              status: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new OrderError("购物车为空，无法创建订单", 400);
      }

      const orderItems: CheckoutItem[] = [];
      let subtotalCents = 0;

      for (const item of cartItems) {
        if (item.product.status !== PRODUCT_STATUS.ACTIVE) {
          throw new OrderError(`商品「${item.product.name}」已下架`, 409);
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.product.id,
            status: PRODUCT_STATUS.ACTIVE,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const latest = await tx.product.findUnique({
            where: { id: item.product.id },
            select: { stock: true, status: true },
          });

          if (!latest || latest.status !== PRODUCT_STATUS.ACTIVE) {
            throw new OrderError(`商品「${item.product.name}」已下架`, 409);
          }

          throw new OrderError(
            `商品「${item.product.name}」库存不足，仅剩 ${latest.stock} 件`,
            409,
          );
        }

        const lineTotal = item.product.priceCents * item.quantity;
        subtotalCents += lineTotal;
        orderItems.push({
          productId: item.product.id,
          productName: item.product.name,
          unitPriceCents: item.product.priceCents,
          quantity: item.quantity,
          subtotalCents: lineTotal,
        });
      }

      const order = await tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          userId,
          status: ORDER_STATUS.PENDING,
          subtotalCents,
          discountCents: 0,
          totalCents: subtotalCents,
          memberLevel: 0,
          discountRateBps: 10000,
          items: { create: orderItems },
        },
        select: orderDetailSelect,
      });

      const removed = await tx.cartItem.deleteMany({
        where: {
          userId,
          id: { in: cartItems.map((item) => item.id) },
        },
      });

      if (removed.count !== cartItems.length) {
        throw new OrderError("购物车已发生变化，请刷新后重试", 409);
      }

      return order;
    }, { timeout: 10_000, maxWait: 5_000 }),
  );
}

export async function payOrder(userId: string, orderId: string) {
  return withOrderRetry(() =>
    prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        select: { id: true, status: true },
      });

      if (!order) {
        throw new OrderError("订单不存在", 404);
      }

      if (order.status !== ORDER_STATUS.PENDING) {
        throw new OrderError("当前订单状态不可支付", 400);
      }

      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: ORDER_STATUS.PENDING,
        },
        data: {
          status: ORDER_STATUS.PAID,
          paidAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new OrderError("当前订单状态不可支付", 400);
      }

      const result = await tx.order.findUnique({
        where: { id: orderId },
        select: orderDetailSelect,
      });

      if (!result) {
        throw new OrderError("订单不存在", 404);
      }

      return result;
    }, { timeout: 10_000, maxWait: 5_000 }),
  );
}

export async function cancelOrder(userId: string, orderId: string) {
  return withOrderRetry(() =>
    prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        select: {
          id: true,
          status: true,
          items: {
            select: { productId: true, quantity: true },
          },
        },
      });

      if (!order) {
        throw new OrderError("订单不存在", 404);
      }

      if (order.status === ORDER_STATUS.CANCELLED) {
        throw new OrderError("订单已取消", 400);
      }

      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: order.status,
        },
        data: {
          status: ORDER_STATUS.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new OrderError("订单状态已变化，请刷新后重试", 409);
      }

      const shouldRestock =
        order.status === ORDER_STATUS.PENDING ||
        order.status === ORDER_STATUS.PAID;

      if (shouldRestock) {
        for (const item of order.items) {
          const restored = await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          if (restored.count === 0) {
            throw new OrderError("商品已不存在，无法恢复库存", 409);
          }
        }
      }

      const result = await tx.order.findUnique({
        where: { id: orderId },
        select: orderDetailSelect,
      });

      if (!result) {
        throw new OrderError("订单不存在", 404);
      }

      return result;
    }, { timeout: 10_000, maxWait: 5_000 }),
  );
}
