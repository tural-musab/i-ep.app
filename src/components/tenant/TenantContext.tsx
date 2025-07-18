import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';

interface TenantContextProps {
  tenant: Tenant | null;
  isLoading: boolean;
  features: Set<string>;
  isFeatureEnabled: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextProps>({
  tenant: null,
  isLoading: true,
  features: new Set(),
  isFeatureEnabled: () => false,
});

export const TenantProvider = ({
  children,
  initialTenant,
}: {
  children: ReactNode;
  initialTenant?: Tenant;
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null);
  const [isLoading, setIsLoading] = useState(!initialTenant);
  const [features, setFeatures] = useState<Set<string>>(new Set());

  // Tenant'a göre özellikleri belirle
  useEffect(() => {
    if (!tenant) return;

    const featureSet = new Set<string>();

    // Temel özellikler
    featureSet.add('basic_dashboard');
    featureSet.add('student_management');
    featureSet.add('simple_grading');

    // Plan tipine göre özellikler
    if (tenant.planType === 'standard' || tenant.planType === 'premium') {
      featureSet.add('advanced_grading');
      featureSet.add('attendance_tracking');
      featureSet.add('parent_portal');
      featureSet.add('report_generation');
    }

    // Premium özellikleri
    if (tenant.planType === 'premium') {
      featureSet.add('advanced_analytics');
      featureSet.add('custom_branding');
      featureSet.add('api_access');
      featureSet.add('integration_support');
    }

    setFeatures(featureSet);
  }, [tenant]);

  // Özellik kontrolü
  const isFeatureEnabled = (feature: string): boolean => {
    return features.has(feature);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        features,
        isFeatureEnabled,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
