import type { Metadata } from "next";
import Link from "next/link";

import { AdminDeleteButton } from "@/components/admin/delete-button";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/form-styles";
import { requireAdminPage } from "@/lib/admin";
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { parsePage } from "@/lib/utils";
import { getAdminProducts } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "商品管理",
};

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdminPage();

  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const result = await getAdminProducts({
    page: parsePage(pageParam),
    search,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            商品管理
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            共 {result.total} 件商品
          </p>
        </div>
        <Link href="/admin/products/new" className={adminPrimaryButtonClass}>
          新增商品
        </Link>
      </div>

      <form
        action="/admin/products"
        method="get"
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <input
          name="q"
          type="search"
          aria-label="搜索商品"
          defaultValue={search}
          placeholder="搜索商品名称或 slug"
          className={`${adminInputClass} sm:max-w-sm`}
        />
        <button type="submit" className={adminPrimaryButtonClass}>
          搜索
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                商品
              </th>
              <th scope="col" className="px-4 py-3">
                分类
              </th>
              <th scope="col" className="px-4 py-3">
                价格
              </th>
              <th scope="col" className="px-4 py-3">
                库存
              </th>
              <th scope="col" className="px-4 py-3">
                状态
              </th>
              <th scope="col" className="px-4 py-3">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  没有找到商品
                </td>
              </tr>
            ) : (
              result.items.map((product) => {
                const status = product.status as ProductStatus;

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          status === PRODUCT_STATUS.ACTIVE
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {PRODUCT_STATUS_LABELS[status] ?? product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs text-neutral-700 hover:text-neutral-900"
                        >
                          编辑
                        </Link>
                        <AdminDeleteButton
                          endpoint={`/api/admin/products/${product.id}`}
                          confirmText={`确定删除商品「${product.name}」吗？`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/products"
        page={result.page}
        totalPages={result.totalPages}
        query={{ q: search || undefined }}
      />
    </div>
  );
}
