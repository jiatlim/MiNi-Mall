import { NextResponse } from "next/server";

import { getCategoriesWithCounts } from "@/server/queries/categories";

export async function GET() {
  try {
    const categories = await getCategoriesWithCounts();

    return NextResponse.json({ items: categories });
  } catch (error) {
    console.error("获取分类列表失败", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}
