"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  inputClassName,
  labelClassName,
  submitClassName,
} from "./form-styles";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "注册失败，请稍后重试");
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
        昵称（可选）
        <input
          name="name"
          type="text"
          autoComplete="nickname"
          maxLength={30}
          placeholder="怎么称呼你"
          className={inputClassName}
        />
      </label>

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
          minLength={6}
          maxLength={72}
          autoComplete="new-password"
          placeholder="至少 6 位"
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
        {pending ? "注册中…" : "注册"}
      </button>
    </form>
  );
}
