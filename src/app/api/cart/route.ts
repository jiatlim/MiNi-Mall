import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureJsonRequest } from "@/lib/request-security";
import { getCart } from "@/server/queries/cart";
import { addToCart, CartError } from "@/server/services/cart";
import { addToCartSchema } from "@/validators/cart";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401, headers: NO_STORE },
    );
  }

  try {
    const cart = await getCart(user.id);
    return NextResponse.json(cart, { headers: NO_STORE });
  } catch (error) {
    console.error("获取购物车失败", error);
    return NextResponse.json(
      { error: "获取购物车失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: Request) {
  const securityError = ensureJsonRequest(request);

  if (securityError) {
    return securityError;
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const parsed = addToCartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  try {
    const item = await addToCart(
      user.id,
      parsed.data.productId,
      parsed.data.quantity,
    );

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if (error instanceof CartError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("加入购物车失败", error);
    return NextResponse.json(
      { error: "加入购物车失败，请稍后重试" },
      { status: 500 },
    );
  }
}
