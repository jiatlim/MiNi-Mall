import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  SHIPPED: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-neutral-100 text-neutral-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const key = status as OrderStatus;
  const label = ORDER_STATUS_LABELS[key] ?? status;
  const style = styles[key] ?? "bg-neutral-100 text-neutral-600";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
