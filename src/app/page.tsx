import Link from "next/link";

import { CategoryTabs } from "@/components/product/category-tabs";
import { Pagination } from "@/components/product/pagination";
import { ProductCard } from "@/components/product/product-card";
import { SearchForm } from "@/components/product/search-form";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME } from "@/lib/constants";
import { parsePage } from "@/lib/utils";
import { getCategoriesWithCounts } from "@/server/queries/categories";
import { getProducts } from "@/server/queries/products";

type HomePageProps = {
  searchParams: Promise<{
    search?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
};

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = readParam(params.search);
  const category = readParam(params.category);
  const page = parsePage(readParam(params.page));

  const [productResult, categories] = await Promise.all([
    getProducts({ search, category, page }),
    getCategoriesWithCounts(),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            发现值得买的小物
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            数码、家居、服饰、食品、美妆与图书，按分类浏览，或直接搜索你想要的商品。
          </p>
        </section>

        <section className="mb-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <SearchForm search={search} category={category} />
          <CategoryTabs
            categories={categories}
            activeCategory={category}
            search={search}
          />
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
          <p>
            {activeCategory
              ? `分类：${activeCategory.name}`
              : category
                ? "分类不存在"
                : "全部分类"}
            {search ? ` · 搜索“${search}”` : ""}
            <span className="ml-2 text-neutral-400">
              共 {productResult.total} 件商品
            </span>
          </p>
          {productResult.total > 0 ? (
            <p>
              第 {productResult.page} / {productResult.totalPages} 页
            </p>
          ) : null}
        </div>

        {productResult.items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productResult.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">没有找到商品</p>
            <p className="mt-2 text-sm text-neutral-500">
              试试更换关键词或切换分类。
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              查看全部商品
            </Link>
          </div>
        )}

        <Pagination
          page={productResult.page}
          totalPages={productResult.totalPages}
          search={search}
          category={category}
        />
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500 sm:px-6 lg:px-8">
          {SITE_NAME} · 微型电商演示项目
        </div>
      </footer>
    </div>
  );
}
