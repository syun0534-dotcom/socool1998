import { WishlistClient } from "@/components/wine/WishlistClient";
import { BottomNav } from "@/components/wine/BottomNav";
import { TopBar } from "@/components/wine/TopBar";
import { getStore } from "@/lib/wine/data";
import { notFound } from "next/navigation";

export default async function WishlistPage({
  params,
}: PageProps<"/wine/[storeId]/wishlist">) {
  const { storeId } = await params;
  const store = getStore(storeId);
  if (!store) notFound();

  return (
    <div className="cm-shell">
      <TopBar storeLabel={store.name} wishHref={`/wine/${storeId}/wishlist`} />
      <section className="cm-section">
        <div className="cm-badge">{store.name}</div>
        <h2>위시리스트</h2>
        <p className="lead">이 매장에서 저장한 후보만 모았습니다.</p>
      </section>
      <WishlistClient storeId={storeId} />
      <BottomNav storeId={storeId} />
    </div>
  );
}
