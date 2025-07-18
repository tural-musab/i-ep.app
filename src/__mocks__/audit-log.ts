/**
 * AuditLogService Mock for Jest Tests
 * Sprint 7: Test environment için AuditLogService mock'u
 */

// Mock Audit Log Types
const AuditLogType = {
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_DELETED: 'tenant.deleted',
  DOMAIN_ADDED: 'domain.added',
  DOMAIN_VERIFIED: 'domain.verified',
  DOMAIN_DELETED: 'domain.deleted',
  DOMAIN_SET_PRIMARY: 'domain.set_primary',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  API_ACCESS: 'api.access',
  SYSTEM_ERROR: 'system.error',
};

// Mock AuditLogService
const AuditLogService = {
  log: jest.fn(() => Promise.resolve()),
  logFromRequest: jest.fn(() => Promise.resolve()),
  queryLogs: jest.fn(() => Promise.resolve([])),
  logResourceChange: jest.fn(() => Promise.resolve()),
  logSystemEvent: jest.fn(() => Promise.resolve()),
};

module.exports = {
  AuditLogType,
  AuditLogService,
};
