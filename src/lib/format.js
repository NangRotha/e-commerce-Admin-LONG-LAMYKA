export function formatPrice(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}
