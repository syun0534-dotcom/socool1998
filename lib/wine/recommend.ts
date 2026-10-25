import { PRICE_BANDS, priceBandFor } from "./catalog.ts";
import { INVENTORY, WINES } from "./data.ts";
import type {
  PairingId,
  PriceBandId,
  RankedWine,
  RecommendFilters,
  ThemeId,
} from "./types.ts";

function bandMid(id: PriceBandId): number {
  const band = PRICE_BANDS.find((b) => b.id === id)!;
  if (!Number.isFinite(band.max)) return band.min * 1.5;
  return (band.min + band.max) / 2;
}

function priceProximityBonus(price: number, bands: PriceBandId[]): number {
  if (bands.length === 0) return 0;
  let best = 0;
  for (const id of bands) {
    const mid = bandMid(id);
    const dist = Math.abs(price - mid);
    const span = Math.max(mid, 1);
    const proximity = Math.max(0, 2 - (dist / span) * 2);
    best = Math.max(best, proximity);
  }
  return best;
}

/**
 * Inventory-bound recommender.
 * Invariant: every result has inventory.qty > 0 for filters.storeId.
 */
export function recommend(filters: RecommendFilters): RankedWine[] {
  const { storeId, themes = [], pairings = [], priceBands = [] } = filters;
  if (!storeId) return [];

  const stock = INVENTORY.filter((i) => i.storeId === storeId && i.qty > 0);
  const results: RankedWine[] = [];

  for (const inv of stock) {
    const wine = WINES.find((w) => w.sku === inv.sku);
    if (!wine) continue;

    if (themes.length > 0 && !themes.some((t) => wine.themes.includes(t))) {
      continue;
    }
    if (
      pairings.length > 0 &&
      !pairings.some((p) => wine.pairings.includes(p))
    ) {
      continue;
    }
    if (priceBands.length > 0) {
      const band = priceBandFor(inv.price);
      if (!priceBands.includes(band)) continue;
    }

    let score = 0;
    for (const t of themes) {
      if (wine.themes.includes(t as ThemeId)) score += 3;
    }
    for (const p of pairings) {
      if (wine.pairings.includes(p as PairingId)) score += 3;
    }
    if (priceBands.length > 0) {
      score += 2;
      score += priceProximityBonus(inv.price, priceBands);
    }
    if (themes.includes("th_beginner") && wine.body !== "full") score += 1;
    if (inv.qty >= 8) score += 1;

    results.push({ wine, inventory: inv, score });
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.inventory.price - b.inventory.price;
  });
}

export function similarInStore(
  storeId: string,
  sku: string,
  limit = 3,
): RankedWine[] {
  const seed = WINES.find((w) => w.sku === sku);
  if (!seed) return [];
  return recommend({
    storeId,
    themes: seed.themes.slice(0, 2),
    pairings: seed.pairings.slice(0, 1),
  }).filter((r) => r.wine.sku !== sku).slice(0, limit);
}
