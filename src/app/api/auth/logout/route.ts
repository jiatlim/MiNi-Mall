import { NextResponse } from "next/server";

import { clearSession } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  const securityError = ensureSameOrigin(request);

  if (securityError) {
    return securityError;
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
