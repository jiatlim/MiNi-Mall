import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            {SITE_NAME}
          </span>
          <span className="hidden text-xs text-neutral-500 sm:inline">
            精选好物
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            购物车
          </Link>
          <Link
            href="/orders"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            <span className="sm:hidden">订单</span>
            <span className="hidden sm:inline">我的订单</span>
          </Link>
          {user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-neutral-600 sm:inline">
                {user.name ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-neutral-500 transition hover:text-neutral-900"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
