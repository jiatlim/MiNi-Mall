import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { ensureSameOrigin } from "@/lib/request-security";
import { cancelOrder, OrderError } from "@/server/services/orders";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const securityError = ensureSameOrigin(request);

  if (securityError) {
    return securityError;
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const limit = rateLimit(`order-cancel:${user.id}`, 30, 60 * 1000);

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
    const order = await cancelOrder(user.id, id);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("取消订单失败", error);
    return NextResponse.json(
      { error: "取消订单失败，请稍后重试" },
      { status: 500 },
    );
  }
}
