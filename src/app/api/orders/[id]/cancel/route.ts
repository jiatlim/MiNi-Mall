import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
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
