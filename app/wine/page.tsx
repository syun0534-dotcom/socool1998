import Link from "next/link";
import { BottomNav } from "@/components/wine/BottomNav";
import { TopBar } from "@/components/wine/TopBar";
import { STORES } from "@/lib/wine/data";

export default function WineHomePage() {
  return (
    <div className="cm-shell">
      <TopBar />

      <section className="cm-hero" aria-label="CellarMatch 소개">
        <div className="cm-hero-bg" />
        <div className="cm-hero-inner">
          <p className="cm-badge" style={{ background: "rgba(255,255,255,0.14)", color: "#f7e7c7" }}>
            O2O · 매장 재고 한정
          </p>
          <h1 className="cm-hero-brand">
            Cellar
            <br />
            <em>Match</em>
          </h1>
          <p className="cm-hero-lead">
            테마·예산·음식으로 고르되, 추천은 항상 지금 고른 매장 선반 안에서만.
          </p>
          <a className="cm-hero-cta" href="#stores">
            매장 고르기
          </a>
        </div>
      </section>

      <section className="cm-section" id="stores">
        <h2>어느 매장에서 사실 건가요?</h2>
        <p className="lead">
          매장을 먼저 정해야 추천이 시작됩니다. 다른 매장·온라인몰 재고는 섞지
          않습니다.
        </p>
        <div className="cm-store-list">
          {STORES.map((store) => (
            <Link
              key={store.id}
              href={`/wine/${store.id}`}
              className="cm-store-card"
            >
              <span className="cm-store-meta">
                {store.neighborhood} · {store.hours}
              </span>
              <strong>{store.name}</strong>
              <p>{store.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cm-section" style={{ paddingBottom: 28 }}>
        <h2>키오스크로 보기</h2>
        <p className="lead">매장 설치용 큰 터치 화면 모드입니다.</p>
        <div className="cm-chip-row">
          {STORES.map((store) => (
            <Link
              key={store.id}
              href={`/wine/kiosk/${store.id}`}
              className="cm-chip"
              style={{ textDecoration: "none" }}
            >
              {store.name}
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
