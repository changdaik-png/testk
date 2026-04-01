import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마음브릿지 MindBridge | AI 심리상담소",
  description:
    "언제 어디서든 당신 곁에. AI 기반 공감 심리상담 서비스 마음브릿지와 함께 마음의 짐을 내려놓으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
