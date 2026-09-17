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

/** ពិនិត្យថា URL ជាវីដេអូ ឬរូបភាព (សម្រាប់ Gallery ផលិតផល) */
export function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg|m4v)(\?|#|$)/i.test(String(url));
}
