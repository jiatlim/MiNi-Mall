"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminDeleteButtonProps = {
  endpoint: string;
  confirmText: string;
  label?: string;
};

export function AdminDeleteButton({
  endpoint,
  confirmText,
  label = "删除",
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(endpoint, { method: "DELETE" });

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
        window.alert(data?.error ?? "删除失败，请稍后重试");
        return;
      }

      router.refresh();
    } catch {
      window.alert("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-600 transition hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "删除中…" : label}
    </button>
  );
}
