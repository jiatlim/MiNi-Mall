import Link from "next/link";

import { formatPrice } from "@/lib/money";
import type { ProductListItem } from "@/server/queries/products";

import { ProductArtwork } from "./product-artwork";

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <ProductArtwork
          name={product.name}
          categorySlug={product.category.slug}
          imageUrl={product.imageUrl}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs text-neutral-500">{product.category.name}</span>
        <h3 className="line-clamp-1 text-base font-medium text-neutral-900">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-neutral-500">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-semibold text-neutral-900">
            {formatPrice(product.priceCents)}
          </span>
          <span
            className={
              product.stock > 0
                ? "text-xs text-emerald-600"
                : "text-xs text-neutral-400"
            }
          >
            {product.stock > 0 ? `库存 ${product.stock}` : "暂时缺货"}
          </span>
        </div>
      </div>
    </Link>
  );
}
