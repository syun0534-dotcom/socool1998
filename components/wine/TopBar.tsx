import Link from "next/link";

export function TopBar({
  storeLabel,
  wishHref,
}: {
  storeLabel?: string;
  wishHref?: string;
}) {
  return (
    <header className="cm-topbar">
      <Link href="/wine" className="cm-brand">
        Cellar<em>Match</em>
      </Link>
      {storeLabel ? (
        <Link href={wishHref ?? "/wine"} className="cm-chip-link">
          {storeLabel}
        </Link>
      ) : (
        <span className="cm-chip-link">재고 안 추천</span>
      )}
    </header>
  );
}
