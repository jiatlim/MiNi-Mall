import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { requireAdminPage } from "@/lib/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminPage();

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader user={user} />
      <AdminTabs />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
