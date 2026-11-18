import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ensureJsonRequest } from "@/lib/request-security";
import { getAdminCategories } from "@/server/queries/admin";
import { adminCategorySchema } from "@/validators/admin";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status, headers: NO_STORE },
    );
  }

  try {
    const items = await getAdminCategories();
    return NextResponse.json({ items }, { headers: NO_STORE });
  } catch (error) {
    console.error("获取分类列表失败", error);
    return NextResponse.json(
      { error: "获取分类列表失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const parsed = adminCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
      },
      select: { id: true, name: true, slug: true },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "分类 slug 已存在" },
        { status: 409 },
      );
    }

    console.error("创建分类失败", error);
    return NextResponse.json(
      { error: "创建分类失败，请稍后重试" },
      { status: 500 },
    );
  }
}
