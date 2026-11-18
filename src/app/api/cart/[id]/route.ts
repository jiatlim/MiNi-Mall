import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureJsonRequest, ensureSameOrigin } from "@/lib/request-security";
import {
  CartError,
  removeCartItem,
  updateCartItemQuantity,
} from "@/server/services/cart";
import { updateCartItemSchema } from "@/validators/cart";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function cartErrorResponse(error: unknown, action: string) {
  if (error instanceof CartError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error(`${action}失败`, error);
  return NextResponse.json(
    { error: `${action}失败，请稍后重试` },
    { status: 500 },
  );
}

export async function PUT(request: Request, { params }: RouteContext) {
  const securityError = ensureJsonRequest(request);

  if (securityError) {
    return securityError;
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const parsed = updateCartItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  try {
    const item = await updateCartItemQuantity(
      user.id,
      id,
      parsed.data.quantity,
    );

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return cartErrorResponse(error, "更新购物车");
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const securityError = ensureSameOrigin(request);

  if (securityError) {
    return securityError;
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await removeCartItem(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return cartErrorResponse(error, "删除购物车商品");
  }
}
