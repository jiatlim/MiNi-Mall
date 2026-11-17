import Link from "next/link";

import { buildQuery } from "@/lib/utils";
import type { CategoryWithCount } from "@/server/queries/categories";

type CategoryTabsProps = {
  categories: CategoryWithCount[];
  activeCategory: string;
  search: string;
};

export function CategoryTabs({
  categories,
  activeCategory,
  search,
}: CategoryTabsProps) {
  const totalCount = categories.reduce(
    (sum, category) => sum + category.productCount,
    0,
  );
  const tabs = [
    { id: "all", name: "全部", slug: "", productCount: totalCount },
    ...categories,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.slug === activeCategory;

        return (
          <Link
            key={tab.id}
            href={`/${buildQuery({ search, category: tab.slug })}`}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
              active
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <span>{tab.name}</span>
            <span
              className={`text-xs ${
                active ? "text-white/70" : "text-neutral-500"
              }`}
            >
              {tab.productCount}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
