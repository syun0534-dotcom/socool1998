"use client";

import { useEffect, useState } from "react";
import { isWished, toggleWishlist } from "@/lib/wine/wishlist";

export function WishButton({
  storeId,
  sku,
  className = "cm-secondary",
}: {
  storeId: string;
  sku: string;
  className?: string;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isWished(storeId, sku));
  }, [storeId, sku]);

  return (
    <button
      type="button"
      className={className}
      onClick={() => setOn(toggleWishlist(storeId, sku))}
    >
      {on ? "위시 해제" : "위시 저장"}
    </button>
  );
}
