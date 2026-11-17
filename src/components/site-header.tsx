import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            {SITE_NAME}
          </span>
          <span className="text-xs text-neutral-500">精选好物</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          返回首页
        </Link>
      </div>
    </header>
  );
}
