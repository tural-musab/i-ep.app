export const cloudflareFixtures = {
  // Başarılı DNS record oluşturma response'u
  createDnsRecordSuccess: {
    success: true,
    errors: [],
    messages: [],
    result: {
      id: '372e67954025e0ba6aaa6d586b9e0b59',
      type: 'CNAME',
      name: 'test-tenant.i-ep.app',
      content: 'i-ep.app',
      proxiable: true,
      proxied: true,
      ttl: 1,
      locked: false,
      zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
      zone_name: 'i-ep.app',
      created_on: '2024-01-15T10:30:00.000000Z',
      modified_on: '2024-01-15T10:30:00.000000Z',
      meta: {
        auto_added: false,
        managed_by_apps: false,
        managed_by_argo_tunnel: false,
        source: 'primary',
      },
    },
  },

  // DNS record oluşturma hatası response'u
  createDnsRecordError: {
    success: false,
    errors: [
      {
        code: 81053,
        message: 'DNS record already exists',
      },
    ],
    messages: [],
    result: null,
  },

  // Zone ID bulma başarılı response'u
  getZoneIdSuccess: {
    success: true,
    errors: [],
    messages: [],
    result: [
      {
        id: '023e105f4ecef8ad9ca31a8372d0c353',
        name: 'i-ep.app',
        status: 'active',
        paused: false,
        type: 'full',
        development_mode: 0,
        name_servers: ['ana.ns.cloudflare.com', 'bob.ns.cloudflare.com'],
        created_on: '2023-01-01T00:00:00.000000Z',
        modified_on: '2024-01-15T10:30:00.000000Z',
        activated_on: '2023-01-01T00:00:00.000000Z',
      },
    ],
  },

  // Zone bulunamadı response'u
  getZoneIdNotFound: {
    success: true,
    errors: [],
    messages: [],
    result: [],
  },

  // Subdomain DNS record'ları listesi
  listDnsRecordsSuccess: {
    success: true,
    errors: [],
    messages: [],
    result: [
      {
        id: '372e67954025e0ba6aaa6d586b9e0b59',
        type: 'CNAME',
        name: 'tenant1.i-ep.app',
        content: 'i-ep.app',
        proxied: true,
        ttl: 1,
        zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
      },
      {
        id: '482e67954025e0ba6aaa6d586b9e0b60',
        type: 'CNAME',
        name: 'tenant2.i-ep.app',
        content: 'i-ep.app',
        proxied: true,
        ttl: 1,
        zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
      },
    ],
  },

  // DNS record silme başarılı response'u
  deleteDnsRecordSuccess: {
    success: true,
    errors: [],
    messages: [],
    result: {
      id: '372e67954025e0ba6aaa6d586b9e0b59',
    },
  },

  // Yetkisiz işlem hatası
  unauthorizedError: {
    success: false,
    errors: [
      {
        code: 10000,
        message: 'Authentication error',
      },
    ],
    messages: [],
  },

  // Rate limit hatası
  rateLimitError: {
    success: false,
    errors: [
      {
        code: 10013,
        message: 'Rate limit exceeded',
      },
    ],
    messages: [],
  },
};

export const cloudflareApiEndpoints = {
  zones: 'https://api.cloudflare.com/client/v4/zones',
  dnsRecords: (zoneId: string) =>
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
  dnsRecord: (zoneId: string, recordId: string) =>
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
};
