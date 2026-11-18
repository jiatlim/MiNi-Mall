import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "注册",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      title="注册"
      subtitle="创建账号，开始浏览和购买商品。"
      footer={
        <>
          已有账号？
          <Link
            href="/login"
            className="ml-1 font-medium text-neutral-900 hover:underline"
          >
            去登录
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
