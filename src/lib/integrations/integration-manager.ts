import { createClient } from '@/lib/supabase/client';
import { GoogleClassroomIntegration, createGoogleClassroomIntegration } from './google-classroom';
import { MicrosoftTeamsIntegration, createMicrosoftTeamsIntegration } from './microsoft-teams';
import { environmentManager } from '@/lib/config/environment';

export type IntegrationType =
  | 'google-classroom'
  | 'microsoft-teams'
  | 'moodle'
  | 'canvas'
  | 'blackboard';

export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  enabled: boolean;
  tenant_id: string;
  config: Record<string, any>;
  credentials: Record<string, any>;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationData {
  courses: number;
  students: number;
  assignments: number;
  submissions: number;
  last_sync: string | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data: IntegrationData;
  errors: string[];
}

export interface IntegrationStatus {
  connected: boolean;
  last_sync: string | null;
  sync_status: 'idle' | 'syncing' | 'success' | 'error';
  error_message?: string;
  data: IntegrationData;
}

export class IntegrationManager {
  private supabase: any;
  private tenantId: string;

  constructor(tenantId: string) {
    this.supabase = createClient();
    this.tenantId = tenantId;
  }

  /**
   * Get all integrations for the tenant
   */
  async getIntegrations(): Promise<IntegrationConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw new Error('Failed to fetch integrations');
    }
  }

  /**
   * Get integration by type
   */
  async getIntegration(type: IntegrationType): Promise<IntegrationConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching integration:', error);
      throw new Error('Failed to fetch integration');
    }
  }

  /**
   * Create or update integration
   */
  async saveIntegration(
    integration: Omit<IntegrationConfig, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<IntegrationConfig> {
    try {
      const existingIntegration = await this.getIntegration(integration.type);

      if (existingIntegration) {
        // Update existing integration
        const { data, error } = await this.supabase
          .from('integrations')
          .update({
            ...integration,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingIntegration.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new integration
        const { data, error } = await this.supabase
          .from('integrations')
          .insert({
            ...integration,
            tenant_id: this.tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      throw new Error('Failed to save integration');
    }
  }

  /**
   * Delete integration
   */
  async deleteIntegration(type: IntegrationType): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('integrations')
        .delete()
        .eq('tenant_id', this.tenantId)
        .eq('type', type);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw new Error('Failed to delete integration');
    }
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(type: IntegrationType): Promise<IntegrationStatus> {
    try {
      const integration = await this.getIntegration(type);

      if (!integration || !integration.enabled) {
        return {
          connected: false,
          last_sync: null,
          sync_status: 'idle',
          data: {
            courses: 0,
            students: 0,
            assignments: 0,
            submissions: 0,
            last_sync: null,
          },
        };
      }

      // Get sync statistics
      const { data: stats, error: statsError } = await this.supabase
        .from('integration_sync_stats')
        .select('*')
        .eq('integration_id', integration.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      return {
        connected: true,
        last_sync: integration.last_sync,
        sync_status: stats?.status || 'idle',
        error_message: stats?.error_message,
        data: {
          courses: stats?.courses_synced || 0,
          students: stats?.students_synced || 0,
          assignments: stats?.assignments_synced || 0,
          submissions: stats?.submissions_synced || 0,
          last_sync: integration.last_sync,
        },
      };
    } catch (error) {
      console.error('Error getting integration status:', error);
      throw new Error('Failed to get integration status');
    }
  }

  /**
   * Sync Google Classroom
   */
  async syncGoogleClassroom(accessToken: string): Promise<SyncResult> {
    try {
      const integration = await this.getIntegration('google-classroom');
      if (!integration || !integration.enabled) {
        throw new Error('Google Classroom integration not enabled');
      }

      const classroom = createGoogleClassroomIntegration();
      classroom.setAccessToken(accessToken);

      // Record sync start
      const syncId = await this.recordSyncStart(integration.id, 'google-classroom');

      const result = await classroom.syncAllCourses();

      // Update integration last sync
      await this.supabase
        .from('integrations')
        .update({
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id);

      // Record sync success
      await this.recordSyncComplete(syncId, 'success', {
        courses_synced: result.courses.length,
        students_synced: result.totalStudents,
        assignments_synced: result.totalAssignments,
        submissions_synced: 0,
      });

      return {
        success: true,
        message: `Successfully synced ${result.courses.length} courses`,
        data: {
          courses: result.courses.length,
          students: result.totalStudents,
          assignments: result.totalAssignments,
          submissions: 0,
          last_sync: new Date().toISOString(),
        },
        errors: [],
      };
    } catch (error) {
      console.error('Error syncing Google Classroom:', error);

      const integration = await this.getIntegration('google-classroom');
      if (integration) {
        const syncId = await this.recordSyncStart(integration.id, 'google-classroom');
        await this.recordSyncComplete(
          syncId,
          'error',
          {},
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        message: 'Failed to sync Google Classroom',
        data: {
          courses: 0,
          students: 0,
          assignments: 0,
          submissions: 0,
          last_sync: null,
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Sync Microsoft Teams
   */
  async syncMicrosoftTeams(accessToken: string): Promise<SyncResult> {
    try {
      const integration = await this.getIntegration('microsoft-teams');
      if (!integration || !integration.enabled) {
        throw new Error('Microsoft Teams integration not enabled');
      }

      const teams = createMicrosoftTeamsIntegration(accessToken);

      // Record sync start
      const syncId = await this.recordSyncStart(integration.id, 'microsoft-teams');

      const result = await teams.syncAllClasses();

      // Update integration last sync
      await this.supabase
        .from('integrations')
        .update({
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id);

      // Record sync success
      await this.recordSyncComplete(syncId, 'success', {
        courses_synced: result.classes.length,
        students_synced: result.totalMembers,
        assignments_synced: result.totalAssignments,
        submissions_synced: 0,
      });

      return {
        success: true,
        message: `Successfully synced ${result.classes.length} classes`,
        data: {
          courses: result.classes.length,
          students: result.totalMembers,
          assignments: result.totalAssignments,
          submissions: 0,
          last_sync: new Date().toISOString(),
        },
        errors: [],
      };
    } catch (error) {
      console.error('Error syncing Microsoft Teams:', error);

      const integration = await this.getIntegration('microsoft-teams');
      if (integration) {
        const syncId = await this.recordSyncStart(integration.id, 'microsoft-teams');
        await this.recordSyncComplete(
          syncId,
          'error',
          {},
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        message: 'Failed to sync Microsoft Teams',
        data: {
          courses: 0,
          students: 0,
          assignments: 0,
          submissions: 0,
          last_sync: null,
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Sync all enabled integrations
   */
  async syncAllIntegrations(): Promise<Record<IntegrationType, SyncResult>> {
    const integrations = await this.getIntegrations();
    const results: Record<string, SyncResult> = {};

    for (const integration of integrations) {
      if (!integration.enabled) continue;

      try {
        switch (integration.type) {
          case 'google-classroom':
            if (integration.credentials.access_token) {
              results[integration.type] = await this.syncGoogleClassroom(
                integration.credentials.access_token
              );
            }
            break;
          case 'microsoft-teams':
            if (integration.credentials.access_token) {
              results[integration.type] = await this.syncMicrosoftTeams(
                integration.credentials.access_token
              );
            }
            break;
          default:
            results[integration.type] = {
              success: false,
              message: 'Integration type not supported yet',
              data: { courses: 0, students: 0, assignments: 0, submissions: 0, last_sync: null },
              errors: ['Integration type not supported yet'],
            };
        }
      } catch (error) {
        results[integration.type] = {
          success: false,
          message: 'Sync failed',
          data: { courses: 0, students: 0, assignments: 0, submissions: 0, last_sync: null },
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
      }
    }

    return results as Record<IntegrationType, SyncResult>;
  }

  /**
   * Record sync start
   */
  private async recordSyncStart(integrationId: string, type: IntegrationType): Promise<string> {
    const { data, error } = await this.supabase
      .from('integration_sync_stats')
      .insert({
        integration_id: integrationId,
        type,
        status: 'syncing',
        started_at: new Date().toISOString(),
        tenant_id: this.tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Record sync completion
   */
  private async recordSyncComplete(
    syncId: string,
    status: 'success' | 'error',
    stats: Record<string, number> = {},
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('integration_sync_stats')
      .update({
        status,
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
        ...stats,
      })
      .eq('id', syncId);

    if (error) throw error;
  }

  /**
   * Test integration connection
   */
  async testConnection(
    type: IntegrationType,
    credentials: Record<string, any>
  ): Promise<{
    success: boolean;
    message: string;
    userInfo?: any;
  }> {
    try {
      switch (type) {
        case 'google-classroom':
          const classroom = createGoogleClassroomIntegration();
          classroom.setAccessToken(credentials.access_token);
          const hasPermissions = await classroom.checkPermissions();
          if (!hasPermissions) {
            return {
              success: false,
              message: 'Insufficient permissions for Google Classroom',
            };
          }
          const userProfile = await classroom.getUserProfile();
          return {
            success: true,
            message: 'Successfully connected to Google Classroom',
            userInfo: userProfile,
          };

        case 'microsoft-teams':
          const teams = createMicrosoftTeamsIntegration(credentials.access_token);
          const teamsPermissions = await teams.checkPermissions();
          if (!teamsPermissions) {
            return {
              success: false,
              message: 'Insufficient permissions for Microsoft Teams',
            };
          }
          const teamsProfile = await teams.getUserProfile();
          return {
            success: true,
            message: 'Successfully connected to Microsoft Teams',
            userInfo: teamsProfile,
          };

        default:
          return {
            success: false,
            message: 'Integration type not supported yet',
          };
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(
    type?: IntegrationType,
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      type: IntegrationType;
      status: 'syncing' | 'success' | 'error';
      started_at: string;
      completed_at: string | null;
      error_message: string | null;
      courses_synced: number;
      students_synced: number;
      assignments_synced: number;
      submissions_synced: number;
    }>
  > {
    try {
      let query = this.supabase
        .from('integration_sync_stats')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sync history:', error);
      throw new Error('Failed to fetch sync history');
    }
  }

  /**
   * Get available integration types
   */
  getAvailableIntegrations(): Array<{
    type: IntegrationType;
    name: string;
    description: string;
    icon: string;
    supported: boolean;
  }> {
    return [
      {
        type: 'google-classroom',
        name: 'Google Classroom',
        description: 'Sync courses, assignments, and grades from Google Classroom',
        icon: 'google-classroom',
        supported: true,
      },
      {
        type: 'microsoft-teams',
        name: 'Microsoft Teams for Education',
        description: 'Sync classes, assignments, and submissions from Microsoft Teams',
        icon: 'microsoft-teams',
        supported: true,
      },
      {
        type: 'moodle',
        name: 'Moodle',
        description: 'Sync courses and activities from Moodle LMS',
        icon: 'moodle',
        supported: false,
      },
      {
        type: 'canvas',
        name: 'Canvas LMS',
        description: 'Sync courses, assignments, and grades from Canvas',
        icon: 'canvas',
        supported: false,
      },
      {
        type: 'blackboard',
        name: 'Blackboard Learn',
        description: 'Sync courses and content from Blackboard Learn',
        icon: 'blackboard',
        supported: false,
      },
    ];
  }
}

// Factory function
export function createIntegrationManager(tenantId: string): IntegrationManager {
  return new IntegrationManager(tenantId);
}

// Utility functions
export function getIntegrationDisplayName(type: IntegrationType): string {
  const names: Record<IntegrationType, string> = {
    'google-classroom': 'Google Classroom',
    'microsoft-teams': 'Microsoft Teams',
    moodle: 'Moodle',
    canvas: 'Canvas LMS',
    blackboard: 'Blackboard Learn',
  };
  return names[type] || type;
}

export function getIntegrationIcon(type: IntegrationType): string {
  const icons: Record<IntegrationType, string> = {
    'google-classroom': '🎓',
    'microsoft-teams': '💼',
    moodle: '📚',
    canvas: '🎨',
    blackboard: '📋',
  };
  return icons[type] || '🔗';
}
