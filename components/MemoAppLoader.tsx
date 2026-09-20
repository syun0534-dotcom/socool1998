"use client";

import dynamic from "next/dynamic";

const MemoApp = dynamic(
  () => import("@/components/MemoApp").then((mod) => mod.MemoApp),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#718096",
        }}
      >
        메모를 불러오는 중...
      </div>
    ),
  },
);

export function MemoAppLoader() {
  return <MemoApp />;
}
