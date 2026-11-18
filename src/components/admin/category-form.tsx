"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "@/components/admin/form-styles";

export function CategoryForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const sortOrder = Number(formData.get("sortOrder") ?? 0);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
    };

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        window.alert("无权限访问");
        router.push("/");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "创建失败，请稍后重试");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={adminLabelClass}>
        分类名称
        <input
          name="name"
          required
          maxLength={50}
          className={adminInputClass}
        />
      </label>

      <label className={adminLabelClass}>
        slug
        <input
          name="slug"
          required
          maxLength={80}
          placeholder="例如 digital"
          className={adminInputClass}
        />
      </label>

      <label className={adminLabelClass}>
        排序
        <input
          name="sortOrder"
          type="number"
          min="0"
          step="1"
          defaultValue={0}
          className={adminInputClass}
        />
      </label>

      <label className={adminLabelClass}>
        描述（可选）
        <textarea
          name="description"
          maxLength={200}
          className={adminTextareaClass}
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

      <button
        type="submit"
        disabled={pending}
        className={adminPrimaryButtonClass}
      >
        {pending ? "创建中…" : "创建分类"}
      </button>
    </form>
  );
}
