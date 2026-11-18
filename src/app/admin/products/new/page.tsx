import type { Metadata } from "next";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/admin";
import { getAdminCategories } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "新增商品",
};

export default async function NewProductPage() {
  await requireAdminPage();
  const categories = await getAdminCategories();
  const options = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          新增商品
        </h1>
        <Link
          href="/admin/products"
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          返回列表
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {options.length === 0 ? (
          <p className="text-sm text-neutral-500">
            还没有分类，请先到
            <Link
              href="/admin/categories"
              className="mx-1 font-medium text-neutral-900 hover:underline"
            >
              分类管理
            </Link>
            创建一个分类。
          </p>
        ) : (
          <ProductForm categories={options} />
        )}
      </div>
    </div>
  );
}
