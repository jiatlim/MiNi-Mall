import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

import { USER_ROLES, type UserRole } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE_NAME = "mini_mall_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const BCRYPT_ROUNDS = 12;
const TOKEN_ISSUER = "mini-mall";
const TOKEN_AUDIENCE = "mini-mall-web";
const MIN_SECRET_BYTES = 32;

// 用户不存在时也执行一次 bcrypt 比较，避免通过响应时间判断账号是否存在。
export const TIMING_SAFE_DUMMY_HASH =
  "$2b$12$8fQN.bYLQYd6i7HbxW5AeukyInSe2IqO6PcoyNm6WjudWY7h7bFIG";

export type Session = {
  userId: string;
  role: UserRole;
};

function readSessionSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret === "replace-me") {
    throw new Error("缺少有效的 AUTH_SECRET 环境变量");
  }

  const bytes = new TextEncoder().encode(secret);

  if (bytes.length < MIN_SECRET_BYTES) {
    throw new Error("AUTH_SECRET 至少需要 32 字节");
  }

  return bytes;
}

const SESSION_SECRET = readSessionSecret();

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function setSession(
  userId: string,
  role: UserRole,
): Promise<void> {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    const userId = payload.sub;
    const role = payload.role;

    if (
      typeof userId !== "string" ||
      (role !== USER_ROLES.USER && role !== USER_ROLES.ADMIN)
    ) {
      return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// 仅供 Server Component 页面使用，同一请求内复用当前用户查询。
export const getCurrentUserForPage = cache(getCurrentUser);
