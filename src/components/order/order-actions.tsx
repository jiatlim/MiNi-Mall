"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ORDER_STATUS } from "@/lib/constants";

type OrderActionsProps = {
  orderId: string;
  status: string;
};

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"pay" | "cancel" | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: "pay" | "cancel") {
    if (action === "cancel") {
      const willRestock =
        status === ORDER_STATUS.PENDING || status === ORDER_STATUS.PAID;
      const stockNote = willRestock
        ? "未发货订单会恢复库存。"
        : "订单已发货或已完成，取消不会恢复库存。";

      if (
        !window.confirm(
          `确定要取消该订单吗？${stockNote}模拟支付不涉及真实退款。`,
        )
      ) {
        return;
      }
    }

    setPending(action);
    setMessage("");

    try {
      const response = await fetch(
        action === "pay"
          ? `/api/orders/${orderId}`
          : `/api/orders/${orderId}/cancel`,
        { method: action === "pay" ? "PUT" : "POST" },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setMessage(data?.error ?? "操作失败，请稍后重试");
        return;
      }

      setMessage(action === "pay" ? "支付成功" : "订单已取消");
      router.refresh();
    } catch {
      setMessage("网络异常，请稍后重试");
    } finally {
      setPending(null);
    }
  }

  const canPay = status === ORDER_STATUS.PENDING;
  const canCancel =
    status === ORDER_STATUS.PENDING || status === ORDER_STATUS.PAID;

  if (!canPay && !canCancel) {
    return null;
  }

  return (
    <div className="mt-6 space-y-2">
      {canPay ? (
        <button
          type="button"
          onClick={() => run("pay")}
          disabled={pending !== null}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {pending === "pay" ? "支付中…" : "模拟支付"}
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          onClick={() => run("cancel")}
          disabled={pending !== null}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending === "cancel" ? "取消中…" : "取消订单"}
        </button>
      ) : null}

      <p
        aria-live="polite"
        className="min-h-5 text-center text-sm text-neutral-600"
      >
        {message}
      </p>
    </div>
  );
}
