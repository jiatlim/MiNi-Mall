const priceFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}
