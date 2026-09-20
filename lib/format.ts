export function formatMemoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function previewBody(body: string): string {
  const collapsed = body.replace(/\s+/g, " ").trim();
  if (!collapsed) return "내용 없음";
  return collapsed;
}

export function displayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed || "제목 없음";
}
