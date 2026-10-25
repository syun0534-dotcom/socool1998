import Link from "next/link";
import { notFound } from "next/navigation";
import { KioskPanel } from "@/components/wine/KioskPanel";
import { getStore, INVENTORY } from "@/lib/wine/data";

export default async function KioskPage({
  params,
}: PageProps<"/wine/kiosk/[storeId]">) {
  const { storeId } = await params;
  const store = getStore(storeId);
  if (!store) notFound();

  const inStock = INVENTORY.filter(
    (i) => i.storeId === storeId && i.qty > 0,
  ).length;

  return (
    <div className="cm-kiosk">
      <div className="cm-shell">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                opacity: 0.75,
              }}
            >
              CellarMatch Kiosk · 재고 {inStock}종
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--cm-font-display)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.03em",
              }}
            >
              {store.name}
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
              테마·가격·음식으로 고르면, 이 매장 선반에 있는 병만 보여줍니다.
            </p>
          </div>
          <Link
            href={`/wine/${storeId}`}
            style={{
              color: "#f7e7c7",
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid rgba(247,231,199,0.35)",
              padding: "10px 14px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            모바일로 이어보기
          </Link>
        </div>

        <KioskPanel storeId={storeId} />
      </div>
    </div>
  );
}
