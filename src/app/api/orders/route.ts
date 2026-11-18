import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { ensureSameOrigin } from "@/lib/request-security";
import { parsePage } from "@/lib/utils";
import { getOrders } from "@/server/queries/orders";
import { createOrder, OrderError } from "@/server/services/orders";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401, headers: NO_STORE },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));

  try {
    const result = await getOrders(user.id, page);
    return NextResponse.json(result, { headers: NO_STORE });
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

  const limit = rateLimit(`order-create:${user.id}`, 10, 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
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
