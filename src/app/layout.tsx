import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// Analytics bileşenini dinamik olarak yükle
const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics), {
  ssr: false,
  loading: () => null,
});

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
        <Analytics />
      </body>
    </html>
  );
}
