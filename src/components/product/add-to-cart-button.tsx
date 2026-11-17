"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  disabled?: boolean;
};

export function AddToCartButton({ disabled = false }: AddToCartButtonProps) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setMessage("购物车功能将在下一步接入，敬请期待。")}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
      >
        {disabled ? "暂时缺货" : "加入购物车"}
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-neutral-500">
        {message}
      </p>
    </div>
  );
}
