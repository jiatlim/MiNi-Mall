import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CartItemRow } from "@/components/cart/cart-item-row";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { getCart } from "@/server/queries/cart";

export const metadata: Metadata = {
  title: "购物车",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cart = await getCart(user.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              购物车
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              共 {cart.totalQuantity} 件商品
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            继续购物
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">购物车是空的</p>
            <p className="mt-2 text-sm text-neutral-500">
              去挑几件喜欢的商品吧。
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              浏览商品
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                订单摘要
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">商品件数</dt>
                  <dd className="font-medium text-neutral-900">
                    {cart.totalQuantity} 件
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">商品总价</dt>
                  <dd className="text-xl font-semibold text-neutral-900">
                    {formatPrice(cart.totalCents)}
                  </dd>
                </div>
                {cart.unavailableCount > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-500">其中暂不可售</dt>
                      <dd className="font-medium text-red-600">
                        {cart.unavailableCount} 件
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-500">可结算金额</dt>
                      <dd className="font-semibold text-neutral-900">
                        {formatPrice(cart.purchasableCents)}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
              <CheckoutButton disabled={cart.unavailableCount > 0} />
              <p className="mt-3 text-center text-xs text-neutral-400">
                会员折扣即将上线
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
