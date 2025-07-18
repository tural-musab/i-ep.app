import { createClient } from '@/lib/supabase/client';
import { NextRequest } from 'next/server';

export interface AuditLog {
  id?: string;
  tenant_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

export interface SecurityEvent {
  type:
    | 'login_attempt'
    | 'password_reset'
    | 'permission_change'
    | 'data_access'
    | 'file_upload'
    | 'api_access'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  tenant_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  description: string;
}

export class SecurityAuditLogger {
  private supabase = createClient();

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditLog: AuditLog = {
      tenant_id: event.tenant_id,
      user_id: event.user_id,
      action: event.type,
      resource_type: 'security_event',
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata: {
        ...event.metadata,
        description: event.description,
      },
      timestamp: new Date().toISOString(),
      severity: event.severity,
      status: 'success',
    };

    await this.createAuditLog(auditLog);
  }

  async logUserAction(
    action: string,
    userId: string,
    tenantId: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    const auditLog: AuditLog = {
      tenant_id: tenantId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: this.getClientIP(request),
      user_agent: request?.headers.get('user-agent') || undefined,
      metadata,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(action),
      status: 'success',
    };

    await this.createAuditLog(auditLog);
  }

  async logFailedAction(
    action: string,
    userId: string | undefined,
    tenantId: string | undefined,
    resourceType: string,
    error: string,
    request?: NextRequest
  ): Promise<void> {
    const auditLog: AuditLog = {
      tenant_id: tenantId,
      user_id: userId,
      action,
      resource_type: resourceType,
      ip_address: this.getClientIP(request),
      user_agent: request?.headers.get('user-agent') || undefined,
      metadata: { error },
      timestamp: new Date().toISOString(),
      severity: 'medium',
      status: 'failure',
    };

    await this.createAuditLog(auditLog);
  }

  private async createAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert([auditLog]);

      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined;

    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return request.ip;
  }

  private determineSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const highSeverityActions = [
      'delete_user',
      'delete_tenant',
      'change_permissions',
      'export_data',
      'system_configuration_change',
    ];

    const mediumSeverityActions = [
      'create_user',
      'update_user',
      'login',
      'logout',
      'password_change',
      'file_upload',
    ];

    if (highSeverityActions.includes(action)) {
      return 'high';
    }

    if (mediumSeverityActions.includes(action)) {
      return 'medium';
    }

    return 'low';
  }

  async getAuditLogs(
    tenantId: string,
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
      action?: string;
      resourceType?: string;
      severity?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<AuditLog[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('timestamp', { ascending: false });

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.action) {
      query = query.eq('action', options.action);
    }

    if (options.resourceType) {
      query = query.eq('resource_type', options.resourceType);
    }

    if (options.severity) {
      query = query.eq('severity', options.severity);
    }

    if (options.startDate) {
      query = query.gte('timestamp', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('timestamp', options.endDate);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  }
}

// Suspicious activity detector
export class SuspiciousActivityDetector {
  private auditLogger = new SecurityAuditLogger();

  async detectSuspiciousActivity(
    userId: string,
    tenantId: string,
    request: NextRequest
  ): Promise<boolean> {
    const recentLogs = await this.auditLogger.getAuditLogs(tenantId, {
      userId,
      limit: 100,
      startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
    });

    // Check for rapid consecutive actions
    const rapidActions = this.detectRapidActions(recentLogs);
    if (rapidActions) {
      await this.auditLogger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        user_id: userId,
        tenant_id: tenantId,
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get('user-agent') || undefined,
        description: 'Rapid consecutive actions detected',
        metadata: { pattern: 'rapid_actions' },
      });
      return true;
    }

    // Check for unusual IP address
    const unusualIP = this.detectUnusualIP(recentLogs, request);
    if (unusualIP) {
      await this.auditLogger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        user_id: userId,
        tenant_id: tenantId,
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get('user-agent') || undefined,
        description: 'Access from unusual IP address',
        metadata: { pattern: 'unusual_ip' },
      });
      return true;
    }

    // Check for unusual user agent
    const unusualUserAgent = this.detectUnusualUserAgent(recentLogs, request);
    if (unusualUserAgent) {
      await this.auditLogger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'low',
        user_id: userId,
        tenant_id: tenantId,
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get('user-agent') || undefined,
        description: 'Access from unusual user agent',
        metadata: { pattern: 'unusual_user_agent' },
      });
      return true;
    }

    return false;
  }

  private detectRapidActions(logs: AuditLog[]): boolean {
    if (logs.length < 10) return false;

    const recentActions = logs.slice(0, 10);
    const timeWindow = 60 * 1000; // 1 minute

    const timestamps = recentActions.map((log) => new Date(log.timestamp!).getTime());
    const oldestTimestamp = Math.min(...timestamps);
    const newestTimestamp = Math.max(...timestamps);

    return newestTimestamp - oldestTimestamp < timeWindow;
  }

  private detectUnusualIP(logs: AuditLog[], request: NextRequest): boolean {
    const currentIP = this.getClientIP(request);
    if (!currentIP) return false;

    const recentIPs = logs.map((log) => log.ip_address).filter(Boolean);
    const uniqueIPs = [...new Set(recentIPs)];

    // If this IP hasn't been seen in recent activity, it's unusual
    return !uniqueIPs.includes(currentIP);
  }

  private detectUnusualUserAgent(logs: AuditLog[], request: NextRequest): boolean {
    const currentUserAgent = request.headers.get('user-agent');
    if (!currentUserAgent) return false;

    const recentUserAgents = logs.map((log) => log.user_agent).filter(Boolean);
    const uniqueUserAgents = [...new Set(recentUserAgents)];

    // If this user agent hasn't been seen in recent activity, it's unusual
    return !uniqueUserAgents.includes(currentUserAgent);
  }

  private getClientIP(request: NextRequest): string | undefined {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return request.ip;
  }
}

// Global audit logger instance
export const auditLogger = new SecurityAuditLogger();
export const suspiciousActivityDetector = new SuspiciousActivityDetector();
