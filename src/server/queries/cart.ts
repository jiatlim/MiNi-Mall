import { PRODUCT_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          stock: true,
          imageUrl: true,
          status: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const itemsWithSubtotal = items.map((item) => {
    const purchasable =
      item.product.status === PRODUCT_STATUS.ACTIVE &&
      item.quantity <= item.product.stock;

    return {
      ...item,
      subtotalCents: item.product.priceCents * item.quantity,
      purchasable,
    };
  });

  return {
    items: itemsWithSubtotal,
    totalCents: itemsWithSubtotal.reduce(
      (sum, item) => sum + item.subtotalCents,
      0,
    ),
    purchasableCents: itemsWithSubtotal.reduce(
      (sum, item) => (item.purchasable ? sum + item.subtotalCents : sum),
      0,
    ),
    totalQuantity: itemsWithSubtotal.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
    unavailableCount: itemsWithSubtotal.filter((item) => !item.purchasable)
      .length,
  };
}

export type Cart = Awaited<ReturnType<typeof getCart>>;
export type CartItemView = Cart["items"][number];
