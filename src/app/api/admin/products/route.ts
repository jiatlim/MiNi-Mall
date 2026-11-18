import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ensureJsonRequest } from "@/lib/request-security";
import { parsePage } from "@/lib/utils";
import { getAdminProducts } from "@/server/queries/admin";
import { adminProductSchema } from "@/validators/admin";

const NO_STORE = { "Cache-Control": "no-store" };

function productErrorResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export async function GET(request: Request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status, headers: NO_STORE },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const search = searchParams.get("q")?.trim() ?? "";

  try {
    const result = await getAdminProducts({ page, search });
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    console.error("获取商品列表失败", error);
    return NextResponse.json(
      { error: "获取商品列表失败" },
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
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
      },
      select: { id: true, name: true, slug: true },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return productErrorResponse(error);
  }
}
