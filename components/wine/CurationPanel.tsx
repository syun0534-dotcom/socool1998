"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PAIRINGS, PRICE_BANDS, THEMES } from "@/lib/wine/catalog";
import type { PairingId, PriceBandId, ThemeId } from "@/lib/wine/types";

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function CurationPanel({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [themes, setThemes] = useState<ThemeId[]>([]);
  const [pairings, setPairings] = useState<PairingId[]>([]);
  const [priceBands, setPriceBands] = useState<PriceBandId[]>([]);

  const canSearch = useMemo(
    () => themes.length + pairings.length + priceBands.length > 0,
    [themes, pairings, priceBands],
  );

  const go = () => {
    const params = new URLSearchParams();
    if (themes.length) params.set("themes", themes.join(","));
    if (pairings.length) params.set("pairings", pairings.join(","));
    if (priceBands.length) params.set("prices", priceBands.join(","));
    startTransition(() => {
      router.push(`/wine/${storeId}/results?${params.toString()}`);
    });
  };

  return (
    <div>
      <section className="cm-section">
        <div className="cm-badge">Step 1 · 테마</div>
        <h2>어떤 자리인가요?</h2>
        <p className="lead">생일, 승진, 데이트… 분위기에 맞는 병을 고릅니다.</p>
        <div className="cm-theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="cm-theme-card"
              data-active={themes.includes(t.id) ? "true" : "false"}
              onClick={() => setThemes((prev) => toggleValue(prev, t.id))}
            >
              <strong>{t.label}</strong>
              <span>{t.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="cm-section">
        <div className="cm-badge">Step 2 · 가격대</div>
        <h2>예산은요?</h2>
        <p className="lead">이 매장 판매가 기준으로 좁힙니다.</p>
        <div className="cm-chip-row">
          {PRICE_BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              className="cm-chip"
              data-active={priceBands.includes(b.id) ? "true" : "false"}
              onClick={() => setPriceBands((prev) => toggleValue(prev, b.id))}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <section className="cm-section">
        <div className="cm-badge">Step 3 · 페어링</div>
        <h2>무엇과 함께?</h2>
        <p className="lead">음식과 맞는 재고만 남깁니다. 건너뛰어도 됩니다.</p>
        <div className="cm-chip-row">
          {PAIRINGS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="cm-chip"
              data-active={pairings.includes(p.id) ? "true" : "false"}
              onClick={() => setPairings((prev) => toggleValue(prev, p.id))}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="cm-section" style={{ paddingBottom: 24 }}>
        <button
          type="button"
          className="cm-primary"
          disabled={!canSearch || pending}
          onClick={go}
        >
          {pending ? "찾는 중…" : "이 매장 재고에서 추천 받기"}
        </button>
      </div>
    </div>
  );
}
