"use client";

import { useMemo, useState } from "react";
import {
  formatWon,
  PAIRINGS,
  PRICE_BANDS,
  THEMES,
  WINE_TYPE_LABEL,
} from "@/lib/wine/catalog";
import { recommend } from "@/lib/wine/recommend";
import type { PairingId, PriceBandId, ThemeId } from "@/lib/wine/types";

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function KioskPanel({ storeId }: { storeId: string }) {
  const [themes, setThemes] = useState<ThemeId[]>([]);
  const [pairings, setPairings] = useState<PairingId[]>([]);
  const [priceBands, setPriceBands] = useState<PriceBandId[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const rows = useMemo(
    () => recommend({ storeId, themes, pairings, priceBands }),
    [storeId, themes, pairings, priceBands],
  );

  const selected = rows.find((r) => r.wine.sku === selectedSku) ?? rows[0];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section>
        <h2 style={{ margin: "0 0 12px", fontFamily: "var(--cm-font-display)" }}>
          테마
        </h2>
        <div className="cm-theme-grid">
          {THEMES.slice(0, 8).map((t) => (
            <button
              key={t.id}
              type="button"
              className="cm-theme-card"
              data-active={themes.includes(t.id) ? "true" : "false"}
              onClick={() => {
                setThemes((prev) => toggleValue(prev, t.id));
                setSelectedSku(null);
              }}
            >
              <strong>{t.label}</strong>
              <span>{t.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: "0 0 12px", fontFamily: "var(--cm-font-display)" }}>
          가격 · 페어링
        </h2>
        <div className="cm-chip-row" style={{ marginBottom: 10 }}>
          {PRICE_BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              className="cm-chip"
              data-active={priceBands.includes(b.id) ? "true" : "false"}
              onClick={() => {
                setPriceBands((prev) => toggleValue(prev, b.id));
                setSelectedSku(null);
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="cm-chip-row">
          {PAIRINGS.slice(0, 10).map((p) => (
            <button
              key={p.id}
              type="button"
              className="cm-chip"
              data-active={pairings.includes(p.id) ? "true" : "false"}
              onClick={() => {
                setPairings((prev) => toggleValue(prev, p.id));
                setSelectedSku(null);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div className="cm-wine-list">
          {rows.length === 0 ? (
            <div className="cm-empty" style={{ color: "rgba(255,248,246,0.75)" }}>
              조건에 맞는 재고가 없습니다. 필터를 조정해 주세요.
            </div>
          ) : (
            rows.map((row) => (
              <button
                key={row.wine.sku}
                type="button"
                className="cm-wine-card"
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  border:
                    selected?.wine.sku === row.wine.sku
                      ? "2px solid #b8955a"
                      : undefined,
                }}
                onClick={() => setSelectedSku(row.wine.sku)}
              >
                <div
                  className="cm-swatch"
                  style={{ background: row.wine.accent }}
                  aria-hidden
                />
                <div>
                  <h3>{row.wine.nameKo}</h3>
                  <p className="sub">
                    {WINE_TYPE_LABEL[row.wine.type]} · 재고 {row.inventory.qty}
                  </p>
                  <div className="cm-wine-meta">
                    <span className="cm-pill">{row.inventory.shelfZone}</span>
                    <span className="cm-price">
                      {formatWon(row.inventory.price)}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {selected ? (
          <div
            style={{
              borderRadius: 24,
              padding: 24,
              minHeight: 280,
              background: `linear-gradient(160deg, ${selected.wine.accent}, #12060a)`,
              color: "#fff8f6",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <p style={{ margin: "0 0 8px", opacity: 0.8, fontWeight: 700 }}>
              진열 위치
            </p>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "2.6rem",
                fontFamily: "var(--cm-font-display)",
                lineHeight: 1,
              }}
            >
              {selected.inventory.shelfZone}
            </p>
            <h3
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--cm-font-display)",
                fontSize: "1.6rem",
              }}
            >
              {selected.wine.nameKo}
            </h3>
            <p style={{ margin: "0 0 12px", opacity: 0.88, lineHeight: 1.45 }}>
              {selected.wine.story}
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "1.2rem" }}>
              {formatWon(selected.inventory.price)} · 남은{" "}
              {selected.inventory.qty}병
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
