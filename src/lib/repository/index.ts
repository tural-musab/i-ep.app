/**
 * Repository Pattern Index
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP Multi-tenant SaaS - Repository Layer
 */

// Base Repository
export {
  BaseRepository,
  RepositoryFactory,
  type BaseEntity,
  type QueryOptions,
  type QueryResult,
  type Database
} from './base-repository';

// Student Repository
export {
  StudentRepository,
  type Student,
  type StudentWithRelations
} from './student-repository';

// Class Repository
export {
  ClassRepository,
  type Class,
  type ClassWithRelations
} from './class-repository';

// Assignment Repository
export {
  AssignmentRepository,
  AssignmentSubmissionRepository,
  type Assignment,
  type AssignmentWithRelations,
  type AssignmentSubmission
} from './assignment-repository';

// Parent Repository
export {
  ParentRepository,
  ParentCommunicationRepository,
  ParentMeetingRepository,
  type Parent,
  type ParentWithRelations,
  type ParentCommunication,
  type ParentMeeting
} from './parent-repository';

/**
 * Repository Service Factory
 * Provides easy access to all repositories with tenant isolation
 */
export class RepositoryService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Student repositories
  get students() {
    return RepositoryFactory.getRepository(StudentRepository, this.tenantId);
  }

  // Class repositories
  get classes() {
    return RepositoryFactory.getRepository(ClassRepository, this.tenantId);
  }

  // Assignment repositories
  get assignments() {
    return RepositoryFactory.getRepository(AssignmentRepository, this.tenantId);
  }

  get assignmentSubmissions() {
    return RepositoryFactory.getRepository(AssignmentSubmissionRepository, this.tenantId);
  }

  // Parent repositories
  get parents() {
    return RepositoryFactory.getRepository(ParentRepository, this.tenantId);
  }

  get parentCommunications() {
    return RepositoryFactory.getRepository(ParentCommunicationRepository, this.tenantId);
  }

  get parentMeetings() {
    return RepositoryFactory.getRepository(ParentMeetingRepository, this.tenantId);
  }

  /**
   * Clear repository cache for current tenant
   */
  clearCache() {
    RepositoryFactory.clearCache(this.tenantId);
  }

  /**
   * Get tenant ID
   */
  getTenantId() {
    return this.tenantId;
  }
}

/**
 * Create repository service with tenant isolation
 */
export function createRepositoryService(tenantId: string): RepositoryService {
  return new RepositoryService(tenantId);
}

/**
 * Repository utilities
 */
export const RepositoryUtils = {
  /**
   * Validate tenant ID format
   */
  validateTenantId(tenantId: string): boolean {
    return typeof tenantId === 'string' && tenantId.length > 0;
  },

  /**
   * Create pagination metadata
   */
  createPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1
    };
  },

  /**
   * Validate query options
   */
  validateQueryOptions(options: QueryOptions): QueryOptions {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {}
    } = options;

    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      filters
    };
  }
};

/**
 * Repository middleware for additional functionality
 */
export class RepositoryMiddleware {
  /**
   * Audit log middleware
   */
  static auditLog<T extends BaseEntity>(
    repository: BaseRepository<T>,
    action: string,
    entityId?: string,
    data?: any
  ) {
    // Implementation for audit logging
    console.log(`[AUDIT] ${action} on ${repository.constructor.name}`, {
      entityId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Performance monitoring middleware
   */
  static async withPerformanceMonitoring<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      console.log(`[PERFORMANCE] ${operation} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[PERFORMANCE] ${operation} failed after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Cache middleware
   */
  static withCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    // Implementation for caching
    // This would integrate with Redis or similar caching solution
    return fn();
  }
}

/**
 * Repository error types
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends RepositoryError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`, 'DUPLICATE_ERROR');
    this.name = 'DuplicateError';
  }
}

export class TenantAccessError extends RepositoryError {
  constructor(tenantId: string) {
    super(`Access denied for tenant ${tenantId}`, 'TENANT_ACCESS_ERROR');
    this.name = 'TenantAccessError';
  }
}