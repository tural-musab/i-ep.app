/**
 * Base Repository Pattern Implementation
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP Multi-tenant SaaS - Database Access Layer
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected supabase;
  protected tableName: string;
  protected tenantId: string;

  constructor(tableName: string, tenantId: string) {
    this.supabase = createServerComponentClient<Database>({ cookies });
    this.tableName = tableName;
    this.tenantId = tenantId;
  }

  /**
   * Tenant-aware base query builder
   */
  protected getBaseQuery() {
    return this.supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', this.tenantId);
  }

  /**
   * Find entity by ID with tenant isolation
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.getBaseQuery()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Find all entities with pagination and filtering
   */
  async findAll(options: QueryOptions = {}): Promise<QueryResult<T>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {}
    } = options;

    let query = this.getBaseQuery();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as T[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Create new entity with tenant isolation
   */
  async create(entity: Omit<T, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...entity,
        tenant_id: this.tenantId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Update entity with tenant isolation
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'tenant_id'>>): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Delete entity with tenant isolation
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }

  /**
   * Count entities with optional filtering
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.getBaseQuery();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query.select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.getBaseQuery()
      .eq('id', id)
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data && data.length > 0;
  }

  /**
   * Transaction wrapper
   */
  async transaction<TResult>(
    operation: (client: typeof this.supabase) => Promise<TResult>
  ): Promise<TResult> {
    // Supabase handles transactions automatically for single operations
    // For complex transactions, we would need to use stored procedures
    return await operation(this.supabase);
  }

  /**
   * Custom query method for complex queries
   */
  protected async customQuery<TResult = any>(
    query: string,
    params: any[] = []
  ): Promise<TResult> {
    const { data, error } = await this.supabase.rpc('execute_custom_query', {
      query_text: query,
      query_params: params,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as TResult;
  }
}

/**
 * Repository Factory
 */
export class RepositoryFactory {
  private static repositories = new Map<string, any>();

  static getRepository<T extends BaseEntity>(
    repositoryClass: new (tenantId: string) => BaseRepository<T>,
    tenantId: string
  ): BaseRepository<T> {
    const key = `${repositoryClass.name}_${tenantId}`;
    
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new repositoryClass(tenantId));
    }
    
    return this.repositories.get(key);
  }

  static clearCache(tenantId?: string) {
    if (tenantId) {
      // Clear specific tenant repositories
      for (const key of this.repositories.keys()) {
        if (key.endsWith(`_${tenantId}`)) {
          this.repositories.delete(key);
        }
      }
    } else {
      // Clear all repositories
      this.repositories.clear();
    }
  }
}

export type { Database };