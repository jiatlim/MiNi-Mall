import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword, setSession } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { ensureJsonRequest } from "@/lib/request-security";
import { registerSchema } from "@/validators/auth";

export async function POST(request: Request) {
  const securityError = ensureJsonRequest(request);

  if (securityError) {
    return securityError;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;
  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);

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
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: USER_ROLES.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await setSession(user.id, USER_ROLES.USER);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    console.error("注册失败", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 },
    );
  }
}
