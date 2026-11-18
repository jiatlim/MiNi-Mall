import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderActions } from "@/components/order/order-actions";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/money";
import { getOrderById } from "@/server/queries/orders";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "订单详情",
};

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getOrderById(user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/orders"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← 返回订单列表
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              订单详情
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{order.orderNo}</p>
            <p className="mt-1 text-xs text-neutral-400">
              下单时间：{formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">商品明细</h2>
            <ul className="mt-2 divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatPrice(item.unitPriceCents)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-neutral-900">
                    {formatPrice(item.subtotalCents)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-neutral-900">金额</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500">商品小计</dt>
                <dd className="font-medium text-neutral-900">
                  {formatPrice(order.subtotalCents)}
                </dd>
              </div>
              {order.discountCents > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">会员优惠</dt>
                  <dd className="font-medium text-emerald-600">
                    −{formatPrice(order.discountCents)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <dt className="text-neutral-500">实付金额</dt>
                <dd className="text-xl font-semibold text-neutral-900">
                  {formatPrice(order.totalCents)}
                </dd>
              </div>
            </dl>

            {order.paidAt ? (
              <p className="mt-4 text-xs text-neutral-500">
                支付时间：{formatDateTime(order.paidAt)}
              </p>
            ) : null}
            {order.cancelledAt ? (
              <p className="mt-2 text-xs text-neutral-500">
                取消时间：{formatDateTime(order.cancelledAt)}
              </p>
            ) : null}

            <OrderActions orderId={order.id} status={order.status} />
          </aside>
        </div>
      </main>
    </div>
  );
}
