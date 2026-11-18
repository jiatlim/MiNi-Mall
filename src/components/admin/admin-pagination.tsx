import Link from "next/link";

import { buildQuery } from "@/lib/utils";

type AdminPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

export function AdminPagination({
  basePath,
  page,
  totalPages,
  query = {},
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const baseClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition";
  const href = (target: number) =>
    `${basePath}${buildQuery({ ...query, page: target })}`;

  return (
    <nav
      aria-label="分页"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={`${baseClass} bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100`}
        >
          上一页
        </Link>
      ) : (
        <span
          className={`${baseClass} bg-white text-neutral-400 ring-1 ring-neutral-200`}
        >
          上一页
        </span>
      )}

      {pages.map((item) => (
        <Link
          key={item}
          href={href(item)}
          aria-current={item === page ? "page" : undefined}
          className={`${baseClass} ${
            item === page
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100"
          }`}
        >
          {item}
        </Link>
      ))}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className={`${baseClass} bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100`}
        >
          下一页
        </Link>
      ) : (
        <span
          className={`${baseClass} bg-white text-neutral-400 ring-1 ring-neutral-200`}
        >
          下一页
        </span>
      )}
    </nav>
  );
}
