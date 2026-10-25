import { notFound } from "next/navigation";
import { BottomNav } from "@/components/wine/BottomNav";
import { CurationPanel } from "@/components/wine/CurationPanel";
import { TopBar } from "@/components/wine/TopBar";
import { getStore, INVENTORY } from "@/lib/wine/data";

export default async function StoreCurationPage({
  params,
}: PageProps<"/wine/[storeId]">) {
  const { storeId } = await params;
  const store = getStore(storeId);
  if (!store) notFound();

  const inStock = INVENTORY.filter(
    (i) => i.storeId === storeId && i.qty > 0,
  ).length;

  return (
    <div className="cm-shell">
      <TopBar
        storeLabel={store.name}
        wishHref={`/wine/${storeId}/wishlist`}
      />

      <section className="cm-section" style={{ paddingTop: 8 }}>
        <div className="cm-badge">매장 재고 {inStock}종</div>
        <h2>{store.name}</h2>
        <p className="lead">
          {store.address} · 여기서 살 수 있는 병만 추천합니다.
        </p>
      </section>

      <CurationPanel storeId={storeId} />
      <BottomNav storeId={storeId} />
    </div>
  );
}
