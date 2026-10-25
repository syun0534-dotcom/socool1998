import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/wine/BottomNav";
import { TopBar } from "@/components/wine/TopBar";
import { WishButton } from "@/components/wine/WishButton";
import {
  formatWon,
  PAIRINGS,
  THEMES,
  WINE_TYPE_LABEL,
} from "@/lib/wine/catalog";
import { getInventoryItem, getStore, getWine } from "@/lib/wine/data";
import { similarInStore } from "@/lib/wine/recommend";

export default async function WineDetailPage({
  params,
}: PageProps<"/wine/[storeId]/w/[sku]">) {
  const { storeId, sku } = await params;
  const store = getStore(storeId);
  const wine = getWine(sku);
  const inv = getInventoryItem(storeId, sku);
  if (!store || !wine || !inv || inv.qty <= 0) notFound();

  const similar = similarInStore(storeId, sku);

  return (
    <div className="cm-shell">
      <TopBar
        storeLabel={store.name}
        wishHref={`/wine/${storeId}/wishlist`}
      />

      <section
        className="cm-detail-hero"
        style={{
          background: `linear-gradient(160deg, ${wine.accent}, #1a0a0e)`,
        }}
      >
        <div className="cm-badge" style={{ background: "rgba(255,255,255,0.16)", color: "#f7e7c7" }}>
          {WINE_TYPE_LABEL[wine.type]} · {store.name} 재고
        </div>
        <h1>{wine.nameKo}</h1>
        <p style={{ margin: 0, opacity: 0.88 }}>
          {wine.name} · {wine.producer}
        </p>
        <p style={{ margin: 0, fontWeight: 800, fontSize: "1.15rem" }}>
          {formatWon(inv.price)}
        </p>
      </section>

      <div className="cm-zone">
        <div>
          <div className="cm-badge">진열 위치</div>
          <strong>{inv.shelfZone}</strong>
          <p className="lead" style={{ marginBottom: 0 }}>
            매장에서 이 구역을 찾아주세요 · 남은 수량 {inv.qty}
          </p>
        </div>
      </div>

      <section className="cm-section">
        <h2>왜 이 병인가요</h2>
        <p className="lead">{wine.story}</p>
        <p className="lead">
          {wine.country} · {wine.region} · {wine.grape} · 바디 {wine.body} ·{" "}
          {wine.sweetness === "dry"
            ? "드라이"
            : wine.sweetness === "off"
              ? "오프드라이"
              : "미디엄 스위트"}
        </p>
        <div className="cm-chip-row" style={{ marginBottom: 12 }}>
          {wine.themes.map((id) => (
            <span key={id} className="cm-chip" data-active="true">
              {THEMES.find((t) => t.id === id)?.label ?? id}
            </span>
          ))}
        </div>
        <div className="cm-chip-row">
          {wine.pairings.map((id) => (
            <span key={id} className="cm-chip">
              {PAIRINGS.find((p) => p.id === id)?.label ?? id}
            </span>
          ))}
        </div>
      </section>

      <div className="cm-actions">
        <WishButton storeId={storeId} sku={sku} />
        <Link
          href={`/wine/${storeId}`}
          className="cm-primary"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          다른 조건으로
        </Link>
      </div>

      {similar.length > 0 ? (
        <section className="cm-section" style={{ paddingBottom: 28 }}>
          <h2>같은 매장에서 비슷한 병</h2>
          <p className="lead">역시 {store.name} 재고만 보여줍니다.</p>
          <div className="cm-wine-list">
            {similar.map((row) => (
              <Link
                key={row.wine.sku}
                href={`/wine/${storeId}/w/${row.wine.sku}`}
                className="cm-wine-card"
              >
                <div
                  className="cm-swatch"
                  style={{ background: row.wine.accent }}
                  aria-hidden
                />
                <div>
                  <h3>{row.wine.nameKo}</h3>
                  <p className="sub">
                    {WINE_TYPE_LABEL[row.wine.type]} · {row.inventory.shelfZone}
                  </p>
                  <div className="cm-wine-meta">
                    <span className="cm-pill stock">재고 {row.inventory.qty}</span>
                    <span className="cm-price">
                      {formatWon(row.inventory.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <BottomNav storeId={storeId} />
    </div>
  );
}
