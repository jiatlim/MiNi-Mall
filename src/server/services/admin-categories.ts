import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AdminCategoryInput } from "@/validators/admin";

export class AdminCategoryError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminCategoryError";
  }
}

export async function createAdminCategory(input: AdminCategoryInput) {
  try {
    return await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        sortOrder: input.sortOrder,
      },
      select: { id: true, name: true, slug: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AdminCategoryError("分类 slug 已存在", 409);
    }

    throw error;
  }
}

export async function deleteAdminCategory(id: string): Promise<void> {
  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new AdminCategoryError("分类不存在", 404);
      }
      if (error.code === "P2003") {
        throw new AdminCategoryError(
          "该分类下还有商品，无法删除",
          409,
        );
      }
    }

    throw error;
  }
}
