import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/request-security";
import { getOrders } from "@/server/queries/orders";
import { createOrder, OrderError } from "@/server/services/orders";

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
    const orders = await getOrders(user.id);
    return NextResponse.json({ items: orders }, { headers: NO_STORE });
  } catch (error) {
    console.error("获取订单列表失败", error);
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: Request) {
  const securityError = ensureSameOrigin(request);

  if (securityError) {
    return securityError;
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const order = await createOrder(user.id);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("创建订单失败", error);
    return NextResponse.json(
      { error: "创建订单失败，请稍后重试" },
      { status: 500 },
    );
  }
}
