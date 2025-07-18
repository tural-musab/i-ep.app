'use client';

import { useEffect, useState } from 'react';
import { useViewport } from '@/hooks/use-mobile';
import { TouchButton } from '@/components/ui/touch-button';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const viewport = useViewport();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show install prompt if already installed or recently dismissed
  const shouldShowPrompt =
    showInstallPrompt &&
    !isInstalled &&
    deferredPrompt &&
    (!localStorage.getItem('pwa-install-dismissed') ||
      Date.now() - parseInt(localStorage.getItem('pwa-install-dismissed') || '0') >
        7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <>
      {children}

      {/* Install Prompt Banner */}
      {shouldShowPrompt && (
        <div
          className={cn(
            'fixed right-4 bottom-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900',
            'md:right-4 md:left-auto md:max-w-sm',
            'animate-in slide-in-from-bottom-2'
          )}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Uygulamayı Yükle
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daha hızlı erişim için Iqra EP'yi{' '}
                {viewport.isMobile ? 'telefonuna' : 'bilgisayarına'} yükle.
              </p>
              <div className="mt-3 flex space-x-2">
                <TouchButton size="sm" onClick={handleInstallClick} touchTarget="comfortable">
                  <Download className="mr-1 h-4 w-4" />
                  Yükle
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  touchTarget="comfortable"
                >
                  Daha Sonra
                </TouchButton>
              </div>
            </div>
            <TouchButton
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              touchTarget="comfortable"
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </TouchButton>
          </div>
        </div>
      )}

      {/* PWA Status Indicator (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 rounded bg-black px-2 py-1 text-xs text-white">
          PWA: {isInstalled ? 'Installed' : 'Not Installed'}
        </div>
      )}
    </>
  );
}
