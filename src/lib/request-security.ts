import { NextResponse } from "next/server";

const MAX_JSON_BODY_BYTES = 16 * 1024;

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  const site = request.headers.get("sec-fetch-site");

  return (
    !site ||
    site === "same-origin" ||
    site === "same-site" ||
    site === "none"
  );
}

export function ensureSameOrigin(request: Request): NextResponse | null {
  if (isSameOrigin(request)) {
    return null;
  }

  return NextResponse.json({ error: "非法请求来源" }, { status: 403 });
}

export function ensureJsonRequest(request: Request): NextResponse | null {
  const originError = ensureSameOrigin(request);

  if (originError) {
    return originError;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
    return NextResponse.json({ error: "请求体过大" }, { status: 413 });
  }

  return null;
}
