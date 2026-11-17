export function parsePage(value: unknown): number {
  const page = typeof value === "number" ? value : Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
