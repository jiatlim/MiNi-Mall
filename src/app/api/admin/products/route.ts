import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminWriteLimit, requireAdmin } from "@/lib/admin";
import { ensureJsonRequest } from "@/lib/request-security";
import { parsePage } from "@/lib/utils";
import { getAdminProducts } from "@/server/queries/admin";
import {
  AdminProductError,
  createAdminProduct,
} from "@/server/services/admin-products";
import { adminProductSchema } from "@/validators/admin";

const NO_STORE = { "Cache-Control": "no-store" };

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

  try {
    const product = await createAdminProduct(parsed.data);

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminProductError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("创建商品失败", error);
    return NextResponse.json(
      { error: "创建商品失败，请稍后重试" },
      { status: 500 },
    );
  }
}
