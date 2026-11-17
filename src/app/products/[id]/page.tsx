import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductArtwork } from "@/components/product/product-artwork";
import { SiteHeader } from "@/components/site-header";
import { formatPrice } from "@/lib/money";
import { buildQuery } from "@/lib/utils";
import { getProductById } from "@/server/queries/products";

const getProduct = cache(getProductById);

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "商品不存在" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const categoryHref = `/${buildQuery({ category: product.category.slug })}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="transition hover:text-neutral-900">
            首页
          </Link>
          <span>/</span>
          <Link href={categoryHref} className="transition hover:text-neutral-900">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <ProductArtwork
              name={product.name}
              categorySlug={product.category.slug}
              imageUrl={product.imageUrl}
              preload
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-neutral-500">{product.category.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-neutral-900">
              {formatPrice(product.priceCents)}
            </p>
            <p className="mt-6 text-base leading-7 text-neutral-600">
              {product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span
                className={
                  product.stock > 0
                    ? "rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                    : "rounded-full bg-neutral-100 px-3 py-1 text-neutral-500"
                }
              >
                {product.stock > 0 ? `现货 ${product.stock} 件` : "暂时缺货"}
              </span>
              <Link
                href={categoryHref}
                className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600 transition hover:bg-neutral-200"
              >
                {product.category.name}
              </Link>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <AddToCartButton disabled={product.stock <= 0} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
