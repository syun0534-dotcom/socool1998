import type { Memo } from "./types";

export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, "").toLowerCase();
}

export function filterMemos(memos: Memo[], query: string): Memo[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return memos;
  return memos.filter((memo) => {
    const title = normalizeQuery(memo.title);
    const body = normalizeQuery(memo.body);
    return title.includes(normalized) || body.includes(normalized);
  });
}
