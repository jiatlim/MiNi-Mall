"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutButtonProps = {
  disabled?: boolean;
};

export function CheckoutButton({ disabled = false }: CheckoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckout() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/orders", { method: "POST" });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        order?: { id: string };
      } | null;

      if (!response.ok) {
        setMessage(data?.error ?? "下单失败，请稍后重试");
        return;
      }

      if (!data?.order?.id) {
        setMessage("下单失败，请稍后重试");
        return;
      }

      router.push(`/orders/${data.order.id}`);
      router.refresh();
    } catch {
      setMessage("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 space-y-2">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={handleCheckout}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {disabled ? "存在暂不可售商品" : pending ? "提交中…" : "提交订单"}
      </button>
      <p
        aria-live="polite"
        className={`min-h-5 text-center text-xs ${
          disabled ? "text-red-600" : "text-neutral-600"
        }`}
      >
        {disabled ? "请先处理暂不可售商品" : message}
      </p>
    </div>
  );
}
