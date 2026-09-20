import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "메모",
  description: "로그인해서 쓰는 메모 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
