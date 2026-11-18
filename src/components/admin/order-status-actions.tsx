"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ORDER_ADMIN_TRANSITIONS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";

type OrderStatusActionsProps = {
  orderId: string;
  status: string;
};

const actionLabels: Partial<Record<OrderStatus, string>> = {
  [ORDER_STATUS.PAID]: "标记已支付",
  [ORDER_STATUS.SHIPPED]: "发货",
  [ORDER_STATUS.COMPLETED]: "完成",
  [ORDER_STATUS.CANCELLED]: "取消订单",
};

const actionStyles: Partial<Record<OrderStatus, string>> = {
  [ORDER_STATUS.PAID]: "bg-emerald-600 hover:bg-emerald-700",
  [ORDER_STATUS.SHIPPED]: "bg-sky-600 hover:bg-sky-700",
  [ORDER_STATUS.COMPLETED]: "bg-neutral-700 hover:bg-neutral-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-600 hover:bg-red-700",
};

export function OrderStatusActions({
  orderId,
  status,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [message, setMessage] = useState("");

  const currentStatus = status as OrderStatus;
  const transitions = ORDER_ADMIN_TRANSITIONS[currentStatus] ?? [];

  async function updateStatus(nextStatus: OrderStatus) {
    if (
      nextStatus === ORDER_STATUS.CANCELLED &&
      !window.confirm(
        `确定要取消订单吗？${
          currentStatus === ORDER_STATUS.PENDING ||
          currentStatus === ORDER_STATUS.PAID
            ? "未发货订单会恢复库存。"
            : "订单已发货或已完成，取消不会恢复库存。"
        }模拟支付不涉及真实退款。`,
      )
    ) {
      return;
    }

    setPending(nextStatus);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
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
        setMessage(data?.error ?? "更新失败，请稍后重试");
        return;
      }

      setMessage(`已更新为「${ORDER_STATUS_LABELS[nextStatus]}」`);
      router.refresh();
    } catch {
      setMessage("网络异常，请稍后重试");
    } finally {
      setPending(null);
    }
  }

  if (transitions.length === 0) {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5">
        {transitions.map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            onClick={() => updateStatus(nextStatus)}
            disabled={pending !== null}
            className={`rounded-full px-2.5 py-1 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              actionStyles[nextStatus] ?? "bg-neutral-600 hover:bg-neutral-700"
            }`}
          >
            {pending === nextStatus
              ? "处理中…"
              : (actionLabels[nextStatus] ?? "更新")}
          </button>
        ))}
      </div>
      {message ? (
        <p aria-live="polite" className="text-xs text-neutral-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}
