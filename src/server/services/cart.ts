import { Prisma } from "@prisma/client";

import { MAX_CART_QUANTITY, PRODUCT_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export class CartError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CartError";
  }
}

const cartItemSelect = {
  id: true,
  productId: true,
  quantity: true,
} as const;

function isRetryableWriteError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" || error.code === "P2034")
  );
}

async function withWriteRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isRetryableWriteError(error)) {
      return operation();
    }

    throw error;
  }
}

function assertQuantityAvailable(
  quantity: number,
  product: { stock: number },
): void {
  const maxQuantity = Math.min(product.stock, MAX_CART_QUANTITY);

  if (quantity <= maxQuantity) {
    return;
  }

  if (quantity > product.stock) {
    throw new CartError(
      product.stock === 0
        ? "商品暂时缺货"
        : `库存不足，当前仅剩 ${product.stock} 件`,
      400,
    );
  }

  throw new CartError(`单个商品最多 ${MAX_CART_QUANTITY} 件`, 400);
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
) {
  return withWriteRetry(() =>
    prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, status: PRODUCT_STATUS.ACTIVE },
        select: { id: true, stock: true },
      });

      if (!product) {
        throw new CartError("商品不存在或已下架", 404);
      }

      const item = await tx.cartItem.upsert({
        where: { userId_productId: { userId, productId } },
        create: { userId, productId, quantity },
        update: { quantity: { increment: quantity } },
        select: cartItemSelect,
      });

      assertQuantityAvailable(item.quantity, product);

      return item;
    }),
  );
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
) {
  return withWriteRetry(() =>
    prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: { id: itemId, userId },
        select: {
          id: true,
          product: {
            select: { stock: true, status: true },
          },
        },
      });

      if (!item) {
        throw new CartError("购物车项不存在", 404);
      }

      if (item.product.status !== PRODUCT_STATUS.ACTIVE) {
        throw new CartError("商品已下架，请删除该商品", 400);
      }

      assertQuantityAvailable(quantity, item.product);

      const result = await tx.cartItem.updateMany({
        where: { id: itemId, userId },
        data: { quantity },
      });

      if (result.count === 0) {
        throw new CartError("购物车项不存在", 404);
      }

      const updated = await tx.cartItem.findUnique({
        where: { id: itemId },
        select: cartItemSelect,
      });

      if (!updated) {
        throw new CartError("购物车项不存在", 404);
      }

      return updated;
    }),
  );
}

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId },
  });

  if (result.count === 0) {
    throw new CartError("购物车项不存在", 404);
  }
}
