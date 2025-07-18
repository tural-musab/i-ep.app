/**
 * Subscription Plans Component
 * Sprint 1: Payment Integration Foundation
 *
 * Displays available subscription plans with pricing and features
 * Handles plan selection and subscription creation
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Zap, Crown, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxStudents: number | null;
  maxTeachers: number | null;
  maxClasses: number | null;
  features: Record<string, unknown>;
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
  popular?: boolean;
}

export interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentPlan?: string;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  loading?: boolean;
  className?: string;
}

// ==========================================
// FEATURE DEFINITIONS
// ==========================================

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  messaging: <MessageSquare className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  api_access: <Zap className="h-4 w-4" />,
  custom_domain: <Crown className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  integrations: <Zap className="h-4 w-4" />,
  bulk_operations: <Users className="h-4 w-4" />,
  white_label: <Crown className="h-4 w-4" />,
};

const FEATURE_LABELS: Record<string, string> = {
  messaging: 'Mesajlaşma Sistemi',
  reports: 'Gelişmiş Raporlar',
  api_access: 'API Erişimi',
  custom_domain: 'Özel Domain',
  analytics: 'Detaylı Analitik',
  integrations: 'Entegrasyonlar',
  bulk_operations: 'Toplu İşlemler',
  white_label: 'White Label',
};

// ==========================================
// PLAN CARD COMPONENT
// ==========================================

interface PlanCardProps {
  plan: SubscriptionPlan;
  isYearly: boolean;
  currentPlan?: string;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  loading?: boolean;
}

function PlanCard({ plan, isYearly, currentPlan, onSelectPlan, loading }: PlanCardProps) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const monthlyPrice = isYearly ? plan.priceYearly / 12 : plan.priceMonthly;
  const yearlyDiscount =
    plan.priceYearly > 0 ? Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100) : 0;

  const isCurrentPlan = currentPlan === plan.id;
  const isPremium = plan.name === 'premium';
  const isPopular = plan.name === 'standard' || plan.popular;

  // Get plan features
  const features = plan.features || {};
  const featureList = Object.entries(features).filter(
    ([, value]) => value !== false && value !== ''
  );

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col transition-all duration-200',
        isPremium && 'border-purple-200 shadow-lg',
        isCurrentPlan && 'ring-2 ring-blue-500',
        'hover:shadow-lg'
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <Badge className="bg-orange-500 px-3 py-1 text-white hover:bg-orange-600">
            <Star className="mr-1 h-3 w-3" />
            En Popüler
          </Badge>
        </div>
      )}

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-purple-500 px-3 py-1 text-white hover:bg-purple-600">
            <Crown className="mr-1 h-3 w-3" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl font-bold">{plan.displayName}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {plan.description}
        </CardDescription>

        {/* Pricing */}
        <div className="mt-4">
          {price === 0 ? (
            <div className="text-3xl font-bold text-green-600">Ücretsiz</div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl font-bold">
                ₺{price.toLocaleString('tr-TR')}
                <span className="text-muted-foreground text-lg font-normal">
                  /{isYearly ? 'yıl' : 'ay'}
                </span>
              </div>
              {isYearly && plan.priceMonthly > 0 && (
                <div className="text-muted-foreground text-sm">
                  Aylık ₺{monthlyPrice.toFixed(0)} (₺
                  {(plan.priceMonthly * 12 - plan.priceYearly).toLocaleString('tr-TR')} tasarruf)
                </div>
              )}
              {isYearly && yearlyDiscount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  %{yearlyDiscount} indirim
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Trial Period */}
        {plan.trialDays > 0 && (
          <div className="text-sm font-medium text-blue-600">
            {plan.trialDays} gün ücretsiz deneme
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Resource Limits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Limitler</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Öğrenci</span>
              <span className="font-medium">
                {plan.maxStudents === null ? 'Sınırsız' : plan.maxStudents.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Öğretmen</span>
              <span className="font-medium">
                {plan.maxTeachers === null ? 'Sınırsız' : plan.maxTeachers.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sınıf</span>
              <span className="font-medium">
                {plan.maxClasses === null ? 'Sınırsız' : plan.maxClasses.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        {featureList.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Özellikler</h4>
            <div className="space-y-2">
              {featureList.map(([featureKey, featureValue]) => {
                const icon = FEATURE_ICONS[featureKey];
                const label = FEATURE_LABELS[featureKey] || featureKey;

                return (
                  <div key={featureKey} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    <span>
                      {label}
                      {typeof featureValue === 'string' && featureValue !== 'true' && (
                        <span className="text-muted-foreground ml-1">({featureValue})</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Basic Features (for all plans) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Temel Özellikler</h4>
          <div className="space-y-1 text-sm">
            {[
              'Öğrenci ve öğretmen yönetimi',
              'Sınıf ve ders programı',
              'Devam takibi',
              'Not girişi ve hesaplama',
              'Temel raporlar',
              'E-posta bildirimleri',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'secondary' : isPremium ? 'default' : 'outline'}
          disabled={loading || isCurrentPlan}
          onClick={() => onSelectPlan(plan.id, isYearly ? 'yearly' : 'monthly')}
          size="lg"
        >
          {isCurrentPlan
            ? 'Mevcut Plan'
            : plan.priceMonthly === 0
              ? 'Ücretsiz Başlat'
              : `${isYearly ? 'Yıllık' : 'Aylık'} Planı Seç`}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function SubscriptionPlans({
  plans,
  currentPlan,
  onSelectPlan,
  loading = false,
  className,
}: SubscriptionPlansProps) {
  const [isYearly, setIsYearly] = useState(false);

  // Sort plans by sort order
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold">Abonelik Planları</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Okulunuzun ihtiyaçlarına en uygun planı seçin. Tüm planlar 14 gün ücretsiz deneme ile
          başlar.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="billing-toggle" className={cn(!isYearly && 'font-medium')}>
            Aylık
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
            disabled={loading}
          />
          <Label htmlFor="billing-toggle" className={cn(isYearly && 'font-medium')}>
            Yıllık
            <Badge variant="secondary" className="ml-2 text-xs">
              İndirimli
            </Badge>
          </Label>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isYearly={isYearly}
            currentPlan={currentPlan}
            onSelectPlan={onSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl space-y-6">
        <h3 className="text-center text-xl font-semibold">Sık Sorulan Sorular</h3>
        <div className="grid gap-4">
          <details className="group rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              Planımı istediğim zaman değiştirebilir miyim?
            </summary>
            <p className="text-muted-foreground mt-2">
              Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklikler
              anında geçerli olur ve faturalandırma pro-rated olarak hesaplanır.
            </p>
          </details>

          <details className="group rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              Ücretsiz deneme süresi nasıl çalışır?
            </summary>
            <p className="text-muted-foreground mt-2">
              Tüm ücretli planlar 14 gün ücretsiz deneme ile başlar. Deneme süresince kredi
              kartınızdan ücret çekilmez ve istediğiniz zaman iptal edebilirsiniz.
            </p>
          </details>

          <details className="group rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">Verilerim güvende mi?</summary>
            <p className="text-muted-foreground mt-2">
              Evet, tüm verileriniz şifrelenir ve güvenli sunucularda saklanır. KVKK uyumlu olarak
              çalışıyoruz ve verilerinizi asla üçüncü taraflarla paylaşmıyoruz.
            </p>
          </details>

          <details className="group rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              Yıllık planla ne kadar tasarruf ederim?
            </summary>
            <p className="text-muted-foreground mt-2">
              Yıllık planları seçtiğinizde 2 ay ücretsiz kullanım elde edersiniz. Bu da %17 oranında
              tasarruf anlamına gelir.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
