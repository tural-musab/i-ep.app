export interface DomainProvider {
  createSubdomain(tenant: { id: string; subdomain: string }): Promise<boolean>;
  setupCustomDomain(
    tenant: { id: string },
    customDomain: string
  ): Promise<{ success: boolean; verificationDetails?: any }>;
  removeSubdomain(tenantId: string, subdomain: string): Promise<boolean>;
  verifyCustomDomain(domain: string): Promise<DomainVerificationStatus>;
}

export interface CloudflareZoneConfig {
  zoneId: string;
  apiToken: string;
  baseDomain: string;
}

export interface DomainVerificationStatus {
  domain: string;
  verified: boolean;
  status: 'pending' | 'active' | 'error';
  lastChecked?: Date;
  error?: string;
}

export interface TenantDomain {
  id: string;
  tenantId: string;
  domain: string;
  type: 'subdomain' | 'custom';
  status: 'pending' | 'active' | 'error';
  createdAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
}
