export function selectAfterDelete<T extends { id: string }>(
  items: T[],
  deletedId: string,
): T | null {
  const index = items.findIndex((item) => item.id === deletedId);
  const remaining = items.filter((item) => item.id !== deletedId);
  if (remaining.length === 0) return null;
  if (index < 0) return remaining[0];
  return remaining[index] ?? remaining[index - 1] ?? remaining[0];
}
