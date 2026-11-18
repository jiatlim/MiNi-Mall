import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/admin";
import {
  getAdminCategories,
  getAdminProductById,
} from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "编辑商品",
};

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdminPage();

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const options = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            编辑商品
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{product.name}</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          返回列表
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ProductForm
          categories={options}
          product={{
            ...product,
            imageUrl: product.imageUrl,
            updatedAt: product.updatedAt.toISOString(),
          }}
        />
      </div>
    </div>
  );
}
