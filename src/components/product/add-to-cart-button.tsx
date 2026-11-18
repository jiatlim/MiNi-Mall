"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAdd() {
    setPending(true);
    setAdded(false);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setMessage(data?.error ?? "加入购物车失败，请稍后重试");
        return;
      }

      setAdded(true);
      setMessage("已加入购物车");
      router.refresh();
    } catch {
      setMessage("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={handleAdd}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
      >
        {disabled ? "暂时缺货" : pending ? "加入中…" : "加入购物车"}
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-neutral-500">
        {message}
        {added ? (
          <Link
            href="/cart"
            className="ml-2 font-medium text-neutral-900 hover:underline"
          >
            去购物车
          </Link>
        ) : null}
      </p>
    </div>
  );
}
