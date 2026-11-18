import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/request-security";
import { getOrderById } from "@/server/queries/orders";
import { OrderError, payOrder } from "@/server/services/orders";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401, headers: NO_STORE },
    );
  }

  const { id } = await params;

  try {
    const order = await getOrderById(user.id, id);

    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404, headers: NO_STORE },
      );
    }

    return NextResponse.json({ order }, { headers: NO_STORE });
  } catch (error) {
    console.error("获取订单详情失败", error);
    return NextResponse.json(
      { error: "获取订单详情失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
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
    const order = await payOrder(user.id, id);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("订单支付失败", error);
    return NextResponse.json(
      { error: "订单支付失败，请稍后重试" },
      { status: 500 },
    );
  }
}
