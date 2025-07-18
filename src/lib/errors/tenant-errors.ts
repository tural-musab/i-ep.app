/**
 * Tenant İşlemleri Hata Yönetimi
 *
 * Bu modül, tenant işlemlerine özel hata sınıflarını içerir.
 */

/**
 * Tenant ve domain ile ilgili özel hata sınıfları
 */

/**
 * Temel tenant hatası sınıfı
 */
export class TenantError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

/**
 * Tenant oluşturma hatası
 */
export class TenantCreationError extends TenantError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'TenantCreationError';
  }
}

/**
 * Tenant bulunamadı hatası
 */
export class TenantNotFoundError extends TenantError {
  constructor(tenantIdentifier: string) {
    super('tenant_not_found', `Tenant bulunamadı: ${tenantIdentifier}`);
    this.name = 'TenantNotFoundError';
  }
}

/**
 * Tenant domain hatası
 */
export class TenantDomainError extends TenantError {
  constructor(
    public domain: string,
    message: string,
    code: string = 'domain_error'
  ) {
    super(code, message);
    this.name = 'TenantDomainError';
  }
}

/**
 * Tenant subdomain çakışma hatası
 */
export class TenantSubdomainConflictError extends TenantDomainError {
  constructor(subdomain: string) {
    super(subdomain, `Bu subdomain zaten kullanılıyor: ${subdomain}`, 'subdomain_conflict');
    this.name = 'TenantSubdomainConflictError';
  }
}

/**
 * Tenant izni hatası
 */
export class TenantPermissionError extends TenantError {
  constructor(
    public tenantId: string,
    public userId: string
  ) {
    super(
      'tenant_permission_denied',
      `Kullanıcı (${userId}) bu tenant'a (${tenantId}) erişim iznine sahip değil`
    );
    this.name = 'TenantPermissionError';
  }
}

/**
 * Tenant izolasyon hatası
 */
export class TenantIsolationError extends TenantError {
  constructor(
    public requestedTenantId: string,
    public currentTenantId: string
  ) {
    super(
      'tenant_isolation_breach',
      `Erişim ihlali: ${currentTenantId} tenant'ı, ${requestedTenantId} tenant verilerine erişmeye çalışıyor`
    );
    this.name = 'TenantIsolationError';
  }
}

/**
 * Tenant limit aşımı hatası
 */
export class TenantLimitExceededError extends TenantError {
  constructor(
    public tenantId: string,
    public limitType: string,
    public currentValue: number,
    public limitValue: number
  ) {
    super(
      'tenant_limit_exceeded',
      `Tenant (${tenantId}) limit aşımı: ${limitType}, mevcut: ${currentValue}, limit: ${limitValue}`
    );
    this.name = 'TenantLimitExceededError';
  }
}

/**
 * Tenant özellik devre dışı hatası
 */
export class TenantFeatureDisabledError extends TenantError {
  constructor(
    public tenantId: string,
    public featureName: string
  ) {
    super(
      'tenant_feature_disabled',
      `Özellik devre dışı: Tenant (${tenantId}) için '${featureName}' özelliği mevcut planında bulunmuyor`
    );
    this.name = 'TenantFeatureDisabledError';
  }
}

// Tenant erişim hatası - izolasyon ihlali
export class TenantAccessDeniedError extends TenantError {
  constructor(message = 'Tenant verilerine erişim reddedildi') {
    super('TENANT_ACCESS_DENIED', message);
    this.name = 'TenantAccessDeniedError';
  }
}

// Tenant güncelleme hatası
export class TenantUpdateError extends TenantError {
  constructor(tenantId: string, message?: string) {
    super('TENANT_UPDATE_ERROR', message || `Tenant güncellenirken bir hata oluştu: ${tenantId}`);
    this.name = 'TenantUpdateError';
  }
}

// Fonksiyonel izolasyon ihlali hatası - tenant veri erişimi sırasında algılanan ihlaller için
export class TenantIsolationBreachError extends TenantError {
  constructor(reason: string) {
    super('TENANT_ISOLATION_BREACH', `Tenant izolasyon ihlali tespit edildi: ${reason}`);
    this.name = 'TenantIsolationBreachError';
  }
}
