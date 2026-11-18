import type { Metadata } from "next";
import Link from "next/link";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { requireAdminPage } from "@/lib/admin";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { formatPrice } from "@/lib/money";
import { buildQuery, parsePage } from "@/lib/utils";
import { getAdminOrders } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "订单管理",
};

type AdminOrdersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdminPage();

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const statusParam = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const result = await getAdminOrders({
    page: parsePage(pageParam),
    status: statusParam,
  });

  const filters = [
    { value: "", label: "全部" },
    ...Object.values(ORDER_STATUS).map((status) => ({
      value: status,
      label: ORDER_STATUS_LABELS[status],
    })),
  ];
  const activeStatus = result.status ?? "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            订单管理
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            共 {result.total} 笔订单
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = activeStatus === filter.value;

          return (
            <Link
              key={filter.value || "all"}
              href={`/admin/orders${buildQuery({ status: filter.value })}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                订单号
              </th>
              <th scope="col" className="px-4 py-3">
                用户
              </th>
              <th scope="col" className="px-4 py-3">
                件数
              </th>
              <th scope="col" className="px-4 py-3">
                金额
              </th>
              <th scope="col" className="px-4 py-3">
                状态
              </th>
              <th scope="col" className="px-4 py-3">
                下单时间
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
                  colSpan={7}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  没有找到订单
                </td>
              </tr>
            ) : (
              result.items.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {order.orderNo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-neutral-900">
                      {order.user.name ?? order.user.email}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {order.user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {order.itemCount}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {formatPrice(order.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusActions
                      orderId={order.id}
                      status={order.status as OrderStatus}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/orders"
        page={result.page}
        totalPages={result.totalPages}
        query={{ status: result.status }}
      />
    </div>
  );
}
