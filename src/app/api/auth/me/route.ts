import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401, headers: NO_STORE },
      );
    }

    return NextResponse.json({ user }, { headers: NO_STORE });
  } catch (error) {
    console.error("获取当前用户失败", error);
    return NextResponse.json(
      { error: "获取当前用户失败" },
      { status: 500, headers: NO_STORE },
    );
  }
}
