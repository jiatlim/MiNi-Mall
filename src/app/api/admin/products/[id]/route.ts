import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ensureJsonRequest, ensureSameOrigin } from "@/lib/request-security";
import { adminProductSchema } from "@/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function productErrorResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "商品 slug 已存在" },
        { status: 409 },
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 400 },
      );
    }
  }

  console.error("商品操作失败", error);
  return NextResponse.json(
    { error: "操作失败，请稍后重试" },
    { status: 500 },
  );
}

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

  const parsed = adminProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json({ error: "分类不存在" }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
      },
      select: { id: true, name: true, slug: true },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return productErrorResponse(error);
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
    await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "商品不存在" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "该商品已有订单记录，无法删除，请改为下架" },
          { status: 409 },
        );
      }
    }

    console.error("删除商品失败", error);
    return NextResponse.json(
      { error: "删除商品失败，请稍后重试" },
      { status: 500 },
    );
  }
}
