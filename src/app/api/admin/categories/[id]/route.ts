import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ensureSameOrigin } from "@/lib/request-security";

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
    await prisma.category.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "分类不存在" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "该分类下还有商品，无法删除" },
          { status: 409 },
        );
      }
    }

    console.error("删除分类失败", error);
    return NextResponse.json(
      { error: "删除分类失败，请稍后重试" },
      { status: 500 },
    );
  }
}
