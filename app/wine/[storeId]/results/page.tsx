import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/wine/BottomNav";
import { TopBar } from "@/components/wine/TopBar";
import {
  formatWon,
  PAIRINGS,
  PRICE_BANDS,
  THEMES,
  WINE_TYPE_LABEL,
} from "@/lib/wine/catalog";
import { getStore } from "@/lib/wine/data";
import { recommend } from "@/lib/wine/recommend";
import type { PairingId, PriceBandId, ThemeId } from "@/lib/wine/types";

function splitCsv<T extends string>(value: string | undefined): T[] {
  if (!value) return [];
  return value.split(",").filter(Boolean) as T[];
}

export default async function ResultsPage({
  params,
  searchParams,
}: PageProps<"/wine/[storeId]/results">) {
  const { storeId } = await params;
  const store = getStore(storeId);
  if (!store) notFound();

  const sp = await searchParams;
  const themes = splitCsv<ThemeId>(
    typeof sp.themes === "string" ? sp.themes : undefined,
  );
  const pairings = splitCsv<PairingId>(
    typeof sp.pairings === "string" ? sp.pairings : undefined,
  );
  const priceBands = splitCsv<PriceBandId>(
    typeof sp.prices === "string" ? sp.prices : undefined,
  );

  const rows = recommend({ storeId, themes, pairings, priceBands });

  const filterLabels = [
    ...themes.map((id) => THEMES.find((t) => t.id === id)?.label ?? id),
    ...priceBands.map((id) => PRICE_BANDS.find((b) => b.id === id)?.label ?? id),
    ...pairings.map((id) => PAIRINGS.find((p) => p.id === id)?.label ?? id),
  ];

  return (
    <div className="cm-shell">
      <TopBar
        storeLabel={store.name}
        wishHref={`/wine/${storeId}/wishlist`}
      />

      <section className="cm-section">
        <div className="cm-badge">{store.name} · 재고 한정</div>
        <h2>추천 {rows.length}병</h2>
        <p className="lead">
          {filterLabels.length
            ? filterLabels.join(" · ")
            : "필터 없이 매장 전체 재고"}
        </p>
        <Link href={`/wine/${storeId}`} className="cm-chip-link">
          필터 다시 고르기
        </Link>
      </section>

      <section className="cm-section" style={{ paddingTop: 4 }}>
        {rows.length === 0 ? (
          <div className="cm-empty">
            이 매장 재고에는 조건에 맞는 와인이 없습니다. 필터를 넓혀 보세요.
          </div>
        ) : (
          <div className="cm-wine-list">
            {rows.map((row, index) => (
              <Link
                key={row.wine.sku}
                href={`/wine/${storeId}/w/${row.wine.sku}`}
                className="cm-wine-card"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div
                  className="cm-swatch"
                  style={{ background: row.wine.accent }}
                  aria-hidden
                />
                <div>
                  <h3>{row.wine.nameKo}</h3>
                  <p className="sub">
                    {WINE_TYPE_LABEL[row.wine.type]} · {row.wine.region} ·{" "}
                    {row.wine.grape}
                  </p>
                  <div className="cm-wine-meta">
                    <span className="cm-pill stock">
                      재고 {row.inventory.qty}
                    </span>
                    <span className="cm-pill">{row.inventory.shelfZone}</span>
                    <span className="cm-price">
                      {formatWon(row.inventory.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <BottomNav storeId={storeId} />
    </div>
  );
}
