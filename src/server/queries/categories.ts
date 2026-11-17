import { PRODUCT_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          products: {
            where: {
              status: PRODUCT_STATUS.ACTIVE,
            },
          },
        },
      },
    },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    productCount: _count.products,
  }));
}

export type CategoryWithCount = Awaited<
  ReturnType<typeof getCategoriesWithCounts>
>[number];
