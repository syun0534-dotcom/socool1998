import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./wine.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CellarMatch — 매장 재고 와인 큐레이션",
  description:
    "테마·가격·페어링으로 고르되, 선택한 매장 재고 안에서만 추천합니다.",
};

export default function WineLayout({ children }: LayoutProps<"/wine">) {
  return (
    <div className={`cm-app ${fraunces.variable} ${manrope.variable}`}>
      {children}
    </div>
  );
}
