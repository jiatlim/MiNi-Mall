import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminPage } from "@/lib/admin";
import { getAdminStats } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "管理后台",
};

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const stats = await getAdminStats();

  const cards = [
    {
      href: "/admin/products",
      title: "商品管理",
      count: stats.productCount,
      description: "新增、编辑、上下架与删除商品",
    },
    {
      href: "/admin/orders",
      title: "订单管理",
      count: stats.orderCount,
      description: "查看全部订单并推进状态",
    },
    {
      href: "/admin/categories",
      title: "分类管理",
      count: stats.categoryCount,
      description: "新增分类、查看商品数量",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        管理后台
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        管理商品、订单与分类。所有操作仅限管理员。
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">
              {card.count}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
