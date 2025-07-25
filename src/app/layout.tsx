import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AnalyticsClient from '../components/AnalyticsClient';
import SpeedInsightsClient from '../components/SpeedInsightsClient';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsentBanner } from '@/components/gdpr/cookie-consent-banner';
import { PWAProvider } from '@/components/pwa/pwa-provider';
import '@/lib/suppress-warnings'; // Suppress useLayoutEffect warnings
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Iqra Eğitim Portalı',
  description:
    "Türkiye'deki eğitim kurumları için çok kiracılı (multi-tenant) SaaS okul yönetim sistemi",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.webp',
  },
  manifest: '/manifest.json',
  themeColor: '#0EA5E9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Iqra EP',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <PWAProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <CookieConsentBanner />
          </AuthProvider>
        </PWAProvider>
        <AnalyticsClient />
        <SpeedInsightsClient />
      </body>
    </html>
  );
}
