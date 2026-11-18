import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";

type AdminHeaderProps = {
  user: {
    name: string | null;
    email: string;
  };
};

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="font-semibold text-neutral-900">
          Mini Mall 管理后台
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-neutral-900">
            返回商城
          </Link>
          <span className="hidden text-neutral-600 sm:inline">
            {user.name ?? user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
