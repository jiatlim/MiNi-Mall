"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductArtwork } from "@/components/product/product-artwork";
import { MAX_CART_QUANTITY, PRODUCT_STATUS } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import type { CartItemView } from "@/server/queries/cart";

type CartItemRowProps = {
  item: CartItemView;
};

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const unavailable = item.product.status !== PRODUCT_STATUS.ACTIVE;
  const outOfStock = item.product.stock <= 0;
  const exceedsStock = item.quantity > item.product.stock;

  async function request(input: string, init: RequestInit) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(input, init);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "操作失败，请稍后重试");
        return;
      }

      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  function updateQuantity(quantity: number) {
    const target = Math.min(
      quantity,
      item.product.stock,
      MAX_CART_QUANTITY,
    );

    if (target < 1) {
      setError("商品暂时缺货，请删除该商品");
      return;
    }

    if (target === item.quantity) {
      return;
    }

    void request(`/api/cart/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: target }),
    });
  }

  function remove() {
    void request(`/api/cart/${item.id}`, { method: "DELETE" });
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <Link
          href={`/products/${item.product.id}`}
          aria-label={item.product.name}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
        >
          <ProductArtwork
            name={item.product.name}
            categorySlug={item.product.category.slug}
            imageUrl={item.product.imageUrl}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.product.id}`}
                className="line-clamp-1 font-medium text-neutral-900 hover:underline"
              >
                {item.product.name}
              </Link>
              <p className="mt-1 text-xs text-neutral-500">
                {item.product.category.name}
              </p>
            </div>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="shrink-0 text-sm text-neutral-500 transition hover:text-red-600 disabled:opacity-50"
            >
              删除
            </button>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center rounded-full border border-neutral-200">
              <button
                type="button"
                onClick={() => updateQuantity(item.quantity - 1)}
                disabled={pending || unavailable || item.quantity <= 1}
                aria-label="减少数量"
                className="h-9 w-9 rounded-l-full text-lg leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="w-10 text-center text-sm font-medium tabular-nums text-neutral-900"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.quantity + 1)}
                disabled={
                  pending ||
                  unavailable ||
                  outOfStock ||
                  item.quantity >= item.product.stock
                }
                aria-label="增加数量"
                className="h-9 w-9 rounded-r-full text-lg leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                ＋
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-500">
                单价 {formatPrice(item.product.priceCents)}
              </p>
              <p className="text-base font-semibold text-neutral-900">
                小计 {formatPrice(item.subtotalCents)}
              </p>
            </div>
          </div>

          {unavailable ? (
            <p className="text-xs text-red-600">商品已下架，请删除该商品。</p>
          ) : exceedsStock ? (
            <p className="text-xs text-red-600">
              库存不足，当前仅剩 {item.product.stock} 件，请调整数量。
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
