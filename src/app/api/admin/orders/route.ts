import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { parsePage } from "@/lib/utils";
import { getAdminOrders } from "@/server/queries/admin";

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
  const status = searchParams.get("status")?.trim() || undefined;

  try {
    const result = await getAdminOrders({ page, status });
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    console.error("获取订单列表失败", error);
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}
