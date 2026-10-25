"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ storeId }: { storeId?: string }) {
  const pathname = usePathname();
  const base = storeId ? `/wine/${storeId}` : "/wine";

  const items = [
    { href: "/wine", label: "매장", match: (p: string) => p === "/wine" },
    {
      href: storeId ? base : "/wine",
      label: "큐레이션",
      match: (p: string) =>
        Boolean(storeId) &&
        (p === base || p.startsWith(`${base}/results`)),
    },
    {
      href: storeId ? `${base}/wishlist` : "/wine",
      label: "위시",
      match: (p: string) => Boolean(storeId) && p.includes("/wishlist"),
    },
  ];

  return (
    <nav className="cm-bottom" aria-label="하단 메뉴">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          data-active={item.match(pathname) ? "true" : "false"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
