import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "登录",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      title="登录"
      subtitle="使用邮箱和密码进入 Mini Mall。"
      footer={
        <>
          还没有账号？
          <Link
            href="/register"
            className="ml-1 font-medium text-neutral-900 hover:underline"
          >
            立即注册
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
