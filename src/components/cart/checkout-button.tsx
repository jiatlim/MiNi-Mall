"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  disabled?: boolean;
};

export function CheckoutButton({ disabled = false }: CheckoutButtonProps) {
  const [message, setMessage] = useState("");

  return (
    <div className="mt-5 space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setMessage("订单功能将在下一步接入，敬请期待。")}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        提交订单
      </button>
      {disabled ? (
        <p className="text-center text-xs text-red-600">
          请先处理暂不可售商品
        </p>
      ) : message ? (
        <p aria-live="polite" className="text-center text-xs text-neutral-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}
