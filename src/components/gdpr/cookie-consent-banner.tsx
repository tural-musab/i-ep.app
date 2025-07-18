'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Cookie, Shield, BarChart3, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Cookie kategorileri
export interface CookieCategory {
  id: 'necessary' | 'analytics' | 'marketing' | 'preferences';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  cookies: Array<{
    name: string;
    purpose: string;
    duration: string;
    provider: string;
  }>;
}

// Cookie tercihleri interface
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
  version: string;
}

// Cookie kategorileri tanımı
const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Gerekli Çerezler',
    description:
      'Bu çerezler web sitesinin temel işlevlerini sağlamak için gereklidir ve devre dışı bırakılamaz.',
    icon: Shield,
    required: true,
    cookies: [
      {
        name: 'sidebar_state',
        purpose: 'Kenar çubuğu durumunu hatırlar',
        duration: '7 gün',
        provider: 'İ-EP.APP',
      },
      {
        name: 'auth-token',
        purpose: 'Oturum kimlik doğrulaması',
        duration: 'Oturum',
        provider: 'İ-EP.APP',
      },
      {
        name: 'tenant-id',
        purpose: 'Kiracı kimliği',
        duration: '30 gün',
        provider: 'İ-EP.APP',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analitik Çerezleri',
    description: 'Bu çerezler web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur.',
    icon: BarChart3,
    required: false,
    cookies: [
      {
        name: 'va-*',
        purpose: 'Vercel Analytics - Anonim kullanım istatistikleri',
        duration: '2 yıl',
        provider: 'Vercel',
      },
      {
        name: 'si-*',
        purpose: 'Speed Insights - Performans ölçümü',
        duration: '2 yıl',
        provider: 'Vercel',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Pazarlama Çerezleri',
    description: 'Bu çerezler size daha alakalı reklamlar göstermek için kullanılır.',
    icon: Megaphone,
    required: false,
    cookies: [
      {
        name: 'marketing-consent',
        purpose: 'Pazarlama onayı durumu',
        duration: '1 yıl',
        provider: 'İ-EP.APP',
      },
    ],
  },
  {
    id: 'preferences',
    name: 'Tercih Çerezleri',
    description:
      'Bu çerezler web sitesinin davranışını ve görünümünü tercihlerinize göre özelleştirmesini sağlar.',
    icon: Settings,
    required: false,
    cookies: [
      {
        name: 'theme',
        purpose: 'Tema tercihi (açık/koyu)',
        duration: '1 yıl',
        provider: 'İ-EP.APP',
      },
      {
        name: 'language',
        purpose: 'Dil tercihi',
        duration: '1 yıl',
        provider: 'İ-EP.APP',
      },
    ],
  },
];

const CONSENT_VERSION = '1.0';
const CONSENT_STORAGE_KEY = 'cookie-consent';

interface CookieConsentBannerProps {
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

export function CookieConsentBanner({ onPreferencesChange }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  });

  // Component mount edildiğinde mevcut consent durumunu kontrol et
  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookiePreferences;

        // Consent version'ı kontrol et - eski version ise yeniden sor
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(parsed);
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Cookie consent parse error:', error);
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, []);

  // Tercihleri kaydet
  const savePreferences = (newPreferences: CookiePreferences) => {
    const preferencesToSave = {
      ...newPreferences,
      necessary: true, // Her zaman true
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferencesToSave));
    setPreferences(preferencesToSave);
    onPreferencesChange?.(preferencesToSave);

    // Analytics çerezlerini etkinleştir/devre dışı bırak
    if (typeof window !== 'undefined') {
      // Vercel Analytics için
      if (preferencesToSave.analytics) {
        // Analytics'i etkinleştir
        document.dispatchEvent(new CustomEvent('enable-analytics'));
      } else {
        // Analytics'i devre dışı bırak
        document.dispatchEvent(new CustomEvent('disable-analytics'));
      }
    }
  };

  // Tümünü kabul et
  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    savePreferences(allAccepted);
    setIsVisible(false);
    setShowSettings(false);
  };

  // Tümünü reddet (sadece gerekli çerezler)
  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    savePreferences(onlyNecessary);
    setIsVisible(false);
    setShowSettings(false);
  };

  // Özel tercihleri kaydet
  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  // Kategori tercihini güncelle
  const updateCategoryPreference = (categoryId: keyof CookiePreferences, enabled: boolean) => {
    if (categoryId === 'necessary') return; // Gerekli çerezler değiştirilemez

    setPreferences((prev) => ({
      ...prev,
      [categoryId]: enabled,
    }));
  };

  if (!isVisible && !showSettings) {
    return null;
  }

  return (
    <>
      {/* Ana Consent Banner */}
      {isVisible && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-start gap-3">
                <Cookie className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Çerez Tercihleri</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Gerekli
                    çerezler site işlevselliği için zorunludur. Diğer çerezler için tercihlerinizi
                    belirtebilirsiniz.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Çerez politikamızı görüntüle
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                  className="w-full sm:w-auto"
                >
                  Sadece Gerekli
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Özelleştir
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  Tümünü Kabul Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ayarlar Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Çerez Tercihleri
            </DialogTitle>
            <DialogDescription>
              Hangi çerez kategorilerinin etkin olmasını istediğinizi seçin. Gerekli çerezler site
              işlevselliği için zorunludur ve devre dışı bırakılamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Kategori Switches */}
            <div className="space-y-4">
              {COOKIE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isEnabled = preferences[category.id];

                return (
                  <div key={category.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <Icon className="mt-0.5 h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            {category.required && (
                              <Badge variant="secondary" className="text-xs">
                                Gerekli
                              </Badge>
                            )}
                          </div>
                          <p className="mb-3 text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(enabled) =>
                          updateCategoryPreference(category.id, enabled)
                        }
                        disabled={category.required}
                        className="ml-4"
                      />
                    </div>

                    {/* Çerez Detayları */}
                    <details className="mt-3">
                      <summary className="cursor-pointer py-2 text-sm hover:text-blue-600">
                        Çerez detaylarını göster ({category.cookies.length})
                      </summary>
                      <div className="space-y-3 pt-2">
                        {category.cookies.map((cookie, index) => (
                          <div key={index} className="border-l-2 border-gray-100 pl-3">
                            <div className="mb-1 flex items-start justify-between">
                              <span className="font-mono text-sm font-medium">{cookie.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {cookie.provider}
                              </Badge>
                            </div>
                            <p className="mb-1 text-xs text-gray-600">{cookie.purpose}</p>
                            <p className="text-xs text-gray-500">Süre: {cookie.duration}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* GDPR Bilgileri */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                <Shield className="h-4 w-4" />
                Veri Koruma Haklarınız
              </h4>
              <p className="mb-3 text-sm text-blue-800">
                GDPR ve KVKK kapsamında verileriniz üzerinde aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Verilerinizin düzeltilmesini talep etme hakkı</li>
                <li>Verilerinizin silinmesini talep etme hakkı (unutulma hakkı)</li>
                <li>Veri işlemeye itiraz etme hakkı</li>
              </ul>
              <div className="mt-3">
                <Link href="/gdpr" className="text-sm text-blue-600 underline hover:text-blue-800">
                  Veri silme talebinde bulun →
                </Link>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col justify-end gap-2 sm:flex-row">
              <Button variant="outline" onClick={rejectAll}>
                Sadece Gerekli Çerezler
              </Button>
              <Button variant="outline" onClick={acceptAll}>
                Tümünü Kabul Et
              </Button>
              <Button onClick={saveCustomPreferences}>Tercihleri Kaydet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook: Mevcut çerez tercihlerini al
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookiePreferences;
        setPreferences(parsed);
      } catch (error) {
        console.error('Cookie consent parse error:', error);
      }
    }

    setIsLoading(false);
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    hasConsent: (category: keyof CookiePreferences) =>
      preferences ? preferences[category] : false,
    hasGivenConsent: () => preferences !== null,
  };
}
