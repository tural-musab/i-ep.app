import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AnalyticsClient from "../components/AnalyticsClient";
import SpeedInsightsClient from "../components/SpeedInsightsClient";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iqra Eğitim Portalı",
  description: "Türkiye'deki eğitim kurumları için çok kiracılı (multi-tenant) SaaS okul yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <AnalyticsClient />
        <SpeedInsightsClient />
      </body>
    </html>
  );
}
