import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { ensureSameOrigin } from "@/lib/request-security";
import {
  AdminCategoryError,
  deleteAdminCategory,
} from "@/server/services/admin-categories";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status },
    );
  }

  const limit = getAdminWriteLimit(admin.user.id);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const securityError = ensureSameOrigin(request);

  if (securityError) {
    return securityError;
  }

  const { id } = await params;

  try {
    await deleteAdminCategory(id);

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminCategoryError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("删除分类失败", error);
    return NextResponse.json(
      { error: "删除分类失败，请稍后重试" },
      { status: 500 },
    );
  }
}
