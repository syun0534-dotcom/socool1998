const KEY = "cellarmatch.wishlist.v1";

export type WishlistItem = {
  storeId: string;
  sku: string;
  savedAt: number;
};

function readAll(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: WishlistItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function listWishlist(storeId?: string): WishlistItem[] {
  const all = readAll();
  return storeId ? all.filter((i) => i.storeId === storeId) : all;
}

export function isWished(storeId: string, sku: string): boolean {
  return readAll().some((i) => i.storeId === storeId && i.sku === sku);
}

export function toggleWishlist(storeId: string, sku: string): boolean {
  const all = readAll();
  const idx = all.findIndex((i) => i.storeId === storeId && i.sku === sku);
  if (idx >= 0) {
    all.splice(idx, 1);
    writeAll(all);
    return false;
  }
  all.unshift({ storeId, sku, savedAt: Date.now() });
  writeAll(all);
  return true;
}
