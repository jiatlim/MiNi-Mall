import type { Metadata } from "next";

import { AdminDeleteButton } from "@/components/admin/delete-button";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdminPage } from "@/lib/admin";
import { getAdminCategories } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "分类管理",
};

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        分类管理
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        共 {categories.length} 个分类。分类下仍有商品时无法删除。
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <section className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">新增分类</h2>
          <div className="mt-4">
            <CategoryForm />
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  分类
                </th>
                <th scope="col" className="px-4 py-3">
                  描述
                </th>
                <th scope="col" className="px-4 py-3">
                  商品数
                </th>
                <th scope="col" className="px-4 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-neutral-500"
                  >
                    还没有分类
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {category.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {category.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {category.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {category.productCount}
                    </td>
                    <td className="px-4 py-3">
                      <AdminDeleteButton
                        endpoint={`/api/admin/categories/${category.id}`}
                        confirmText={`确定删除分类「${category.name}」吗？`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
