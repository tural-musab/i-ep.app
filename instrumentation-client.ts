// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users browser loads a page in your app.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // DSN'i doğrudan yazmak yerine, ortam değişkeninden güvenli bir şekilde alıyoruz.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ortam etiketini Vercel'in sağladığı değişkenden otomatik olarak alıyoruz.
  // Canlıda "production", staging'de "preview", lokalde "development" olacak.
  environment: process.env.VERCEL_ENV || 'development',

  // Performans takibi için örnekleme oranı. %100'de bırakabilirsin.
  tracesSampleRate: 1.0,

  // Bu ayar, oturum tekrar oynatma (session replay) özelliğini yönetir.
  replaysSessionSampleRate: 0.1, // Oturumların %10'unu kaydet.
  replaysOnErrorSampleRate: 1.0, // Bir hata olursa, o oturumun tamamını kaydet.

  // Sentry'nin kendi dokümantasyonunda önerdiği bir entegrasyon.
  integrations: [
    Sentry.replayIntegration({
      // Kullanıcı gizliliği için tüm metinleri ve resimleri maskele.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
