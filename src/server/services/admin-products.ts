import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  AdminProductInput,
  AdminProductUpdateInput,
} from "@/validators/admin";

export class AdminProductError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminProductError";
  }
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
} as const;

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AdminProductError("分类不存在", 400);
  }
}

function mapWriteError(error: unknown): AdminProductError | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return new AdminProductError("商品 slug 已存在", 409);
    }
    if (error.code === "P2003") {
      return new AdminProductError("分类不存在", 400);
    }
    if (error.code === "P2025") {
      return new AdminProductError("商品不存在", 404);
    }
  }

  return null;
}

function toProductData(input: AdminProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    priceCents: input.priceCents,
    stock: input.stock,
    imageUrl: input.imageUrl || null,
    status: input.status,
    categoryId: input.categoryId,
    sortOrder: input.sortOrder,
  };
}

export async function createAdminProduct(input: AdminProductInput) {
  await assertCategoryExists(input.categoryId);

  try {
    return await prisma.product.create({
      data: toProductData(input),
      select: productSelect,
    });
  } catch (error) {
    const mapped = mapWriteError(error);
    if (mapped) throw mapped;
    throw error;
  }
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductUpdateInput,
) {
  await assertCategoryExists(input.categoryId);

  const version = new Date(input.version);
  if (Number.isNaN(version.getTime())) {
    throw new AdminProductError("版本信息无效，请刷新后重试", 400);
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const updated = await tx.product.updateMany({
          where: { id, updatedAt: version },
          data: toProductData(input),
        });

        if (updated.count === 0) {
          const exists = await tx.product.findUnique({
            where: { id },
            select: { id: true },
          });

          if (!exists) {
            throw new AdminProductError("商品不存在", 404);
          }

          throw new AdminProductError(
            "商品已被其他操作修改，请刷新后重试",
            409,
          );
        }

        const product = await tx.product.findUnique({
          where: { id },
          select: productSelect,
        });

        if (!product) {
          throw new AdminProductError("商品不存在", 404);
        }

        return product;
      },
      { timeout: 10_000, maxWait: 5_000 },
    );
  } catch (error) {
    const mapped = mapWriteError(error);
    if (mapped) throw mapped;
    throw error;
  }
}

export async function deleteAdminProduct(id: string): Promise<void> {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new AdminProductError("商品不存在", 404);
      }
      if (error.code === "P2003") {
        throw new AdminProductError(
          "该商品已有订单记录，无法删除，请改为下架",
          409,
        );
      }
    }

    throw error;
  }
}
