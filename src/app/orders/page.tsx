import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/money";
import { getOrders } from "@/server/queries/orders";

export const metadata: Metadata = {
  title: "我的订单",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await getOrders(user.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              我的订单
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              共 {orders.length} 笔订单
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            继续购物
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">还没有订单</p>
            <p className="mt-2 text-sm text-neutral-500">
              去购物车挑选商品，提交后就能在这里查看。
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              浏览商品
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {order.orderNo}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDateTime(order.createdAt)} · {order.itemCount} 件商品
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-lg font-semibold text-neutral-900">
                      {formatPrice(order.totalCents)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
