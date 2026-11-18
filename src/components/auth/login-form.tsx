"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  inputClassName,
  labelClassName,
  submitClassName,
} from "./form-styles";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "登录失败，请稍后重试");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={labelClassName}>
        邮箱
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClassName}
        />
      </label>

      <label className={labelClassName}>
        密码
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="请输入密码"
          className={inputClassName}
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={submitClassName}>
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
