"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatWon, WINE_TYPE_LABEL } from "@/lib/wine/catalog";
import { getInventoryItem, getWine } from "@/lib/wine/data";
import { listWishlist, toggleWishlist, type WishlistItem } from "@/lib/wine/wishlist";

export function WishlistClient({ storeId }: { storeId: string }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const refresh = () => setItems(listWishlist(storeId));

  useEffect(() => {
    refresh();
  }, [storeId]);

  if (items.length === 0) {
    return (
      <div className="cm-empty">
        아직 저장한 와인이 없습니다. 추천 결과에서 위시를 눌러 보세요.
      </div>
    );
  }

  return (
    <section className="cm-section" style={{ paddingTop: 4, paddingBottom: 28 }}>
      <div className="cm-wine-list">
        {items.map((item) => {
          const wine = getWine(item.sku);
          const inv = getInventoryItem(storeId, item.sku);
          if (!wine) return null;
          const available = inv && inv.qty > 0;

          return (
            <div key={`${item.storeId}-${item.sku}`} className="cm-wine-card">
              <div
                className="cm-swatch"
                style={{
                  background: wine.accent,
                  opacity: available ? 1 : 0.4,
                }}
                aria-hidden
              />
              <div>
                <h3>{wine.nameKo}</h3>
                <p className="sub">
                  {WINE_TYPE_LABEL[wine.type]} ·{" "}
                  {available
                    ? `${inv!.shelfZone} · ${formatWon(inv!.price)}`
                    : "품절 — 추천에서 제외됨"}
                </p>
                <div className="cm-wine-meta">
                  {available ? (
                    <Link
                      href={`/wine/${storeId}/w/${item.sku}`}
                      className="cm-chip-link"
                    >
                      상세 보기
                    </Link>
                  ) : (
                    <span className="cm-pill">품절</span>
                  )}
                  <button
                    type="button"
                    className="cm-chip"
                    onClick={() => {
                      toggleWishlist(storeId, item.sku);
                      refresh();
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
