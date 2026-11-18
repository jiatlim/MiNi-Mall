import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";

type AdminUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

type AdminCheck =
  | { ok: true; user: AdminUser }
  | { ok: false; status: 401 | 403; error: string };

export async function requireAdmin(): Promise<AdminCheck> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, status: 401, error: "请先登录" };
  }

  if (user.role !== USER_ROLES.ADMIN) {
    return { ok: false, status: 403, error: "无权限访问" };
  }

  return { ok: true, user };
}

export async function requireAdminPage(): Promise<AdminUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== USER_ROLES.ADMIN) {
    redirect("/");
  }

  return user;
}

export function getAdminWriteLimit(userId: string): RateLimitResult {
  return rateLimit(`admin-write:${userId}`, 60, 60_000);
}
