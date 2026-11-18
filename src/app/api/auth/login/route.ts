import { NextResponse } from "next/server";

import {
  setSession,
  TIMING_SAFE_DUMMY_HASH,
  verifyPassword,
} from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { ensureJsonRequest } from "@/lib/request-security";
import { loginSchema } from "@/validators/auth";

const GENERIC_LOGIN_ERROR = "邮箱或密码错误";

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

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "请检查输入内容" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(request);
  const emailLimit = rateLimit(`login:${ip}:${email}`, 10, 5 * 60 * 1000);
  const ipLimit = rateLimit(`login-ip:${ip}`, 30, 5 * 60 * 1000);

  if (!emailLimit.allowed || !ipLimit.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(
              emailLimit.retryAfterSeconds,
              ipLimit.retryAfterSeconds,
            ),
          ),
        },
      },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(
      password,
      user?.passwordHash ?? TIMING_SAFE_DUMMY_HASH,
    );

    if (!user || !valid) {
      return NextResponse.json(
        { error: GENERIC_LOGIN_ERROR },
        { status: 401 },
      );
    }

    const role =
      user.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER;

    await setSession(user.id, role);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    console.error("登录失败", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 },
    );
  }
}
