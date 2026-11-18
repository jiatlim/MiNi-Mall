import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { ensureJsonRequest, ensureSameOrigin } from "@/lib/request-security";
import {
  AdminProductError,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/server/services/admin-products";
import { adminProductUpdateSchema } from "@/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
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

  const securityError = ensureJsonRequest(request);

  if (securityError) {
    return securityError;
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const parsed = adminProductUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  try {
    const product = await updateAdminProduct(id, parsed.data);

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    if (error instanceof AdminProductError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("更新商品失败", error);
    return NextResponse.json(
      { error: "更新商品失败，请稍后重试" },
      { status: 500 },
    );
  }
}

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
    await deleteAdminProduct(id);

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminProductError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("删除商品失败", error);
    return NextResponse.json(
      { error: "删除商品失败，请稍后重试" },
      { status: 500 },
    );
  }
}
