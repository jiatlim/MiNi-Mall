import { NextResponse } from "next/server";

import { parsePage } from "@/lib/utils";
import { getProducts } from "@/server/queries/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;
  const page = parsePage(searchParams.get("page"));

  try {
    const result = await getProducts({ search, category, page });

    return NextResponse.json({
      items: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("获取商品列表失败", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}
